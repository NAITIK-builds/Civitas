/**
 * Photo Verification Service Integration
 * Connects Node.js backend with Python verification service
 */

import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

export class PhotoVerificationService {
    constructor(config = {}) {
        this.baseUrl = config.baseUrl || 'http://localhost:8000';
        this.timeout = config.timeout || 30000;
        this.maxRetries = config.maxRetries || 3;
    }

    /**
     * Verify a single photo
     */
    async verifyPhoto(filePath, verificationData) {
        try {
            const formData = new FormData();
            
            // Add the image file
            formData.append('file', fs.createReadStream(filePath));
            
            // Add verification parameters
            formData.append('task_type', verificationData.taskType);
            formData.append('location_lat', verificationData.location.lat);
            formData.append('location_lng', verificationData.location.lng);
            formData.append('location_radius', verificationData.locationRadius || 100);
            formData.append('deadline_start', verificationData.deadlineStart);
            formData.append('deadline_end', verificationData.deadlineEnd);
            formData.append('user_id', verificationData.userId);
            formData.append('requires_video', verificationData.requiresVideo || false);

            const response = await this._makeRequest('/verify-photo', formData, {
                headers: {
                    ...formData.getHeaders(),
                }
            });

            return {
                success: true,
                data: response.data,
                filename: path.basename(filePath)
            };

        } catch (error) {
            console.error('Photo verification failed:', error);
            return {
                success: false,
                error: error.message,
                filename: path.basename(filePath)
            };
        }
    }

    /**
     * Verify multiple photos
     */
    async verifyMultiplePhotos(filePaths, verificationData) {
        try {
            const formData = new FormData();
            
            // Add all image files
            filePaths.forEach(filePath => {
                formData.append('files', fs.createReadStream(filePath));
            });
            
            // Add verification parameters
            formData.append('task_type', verificationData.taskType);
            formData.append('location_lat', verificationData.location.lat);
            formData.append('location_lng', verificationData.location.lng);
            formData.append('location_radius', verificationData.locationRadius || 100);
            formData.append('deadline_start', verificationData.deadlineStart);
            formData.append('deadline_end', verificationData.deadlineEnd);
            formData.append('user_id', verificationData.userId);

            const response = await this._makeRequest('/verify-multiple-photos', formData, {
                headers: {
                    ...formData.getHeaders(),
                }
            });

            return {
                success: true,
                data: response.data,
                totalFiles: filePaths.length
            };

        } catch (error) {
            console.error('Multiple photo verification failed:', error);
            return {
                success: false,
                error: error.message,
                totalFiles: filePaths.length
            };
        }
    }

    /**
     * Extract metadata from a photo
     */
    async extractMetadata(filePath) {
        try {
            const formData = new FormData();
            formData.append('file', fs.createReadStream(filePath));

            const response = await this._makeRequest('/extract-metadata', formData, {
                headers: {
                    ...formData.getHeaders(),
                }
            });

            return {
                success: true,
                data: response.data,
                filename: path.basename(filePath)
            };

        } catch (error) {
            console.error('Metadata extraction failed:', error);
            return {
                success: false,
                error: error.message,
                filename: path.basename(filePath)
            };
        }
    }

    /**
     * Check service health
     */
    async checkHealth() {
        try {
            const response = await this._makeRequest('/health');
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Make HTTP request with retry logic
     */
    async _makeRequest(endpoint, data = null, config = {}) {
        let lastError;
        
        for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
            try {
                const requestConfig = {
                    method: data ? 'POST' : 'GET',
                    url: `${this.baseUrl}${endpoint}`,
                    timeout: this.timeout,
                    ...config
                };

                if (data) {
                    requestConfig.data = data;
                }

                const response = await axios(requestConfig);
                return response;

            } catch (error) {
                lastError = error;
                
                if (attempt === this.maxRetries) {
                    throw error;
                }
                
                // Wait before retry (exponential backoff)
                const delay = Math.pow(2, attempt) * 1000;
                await new Promise(resolve => setTimeout(resolve, delay));
                
                console.log(`Attempt ${attempt} failed, retrying in ${delay}ms...`);
            }
        }
        
        throw lastError;
    }

    /**
     * Process verification results and generate summary
     */
    processVerificationResults(results) {
        if (!Array.isArray(results)) {
            results = [results];
        }

        const summary = {
            totalPhotos: results.length,
            validPhotos: 0,
            invalidPhotos: 0,
            averageScore: 0,
            issues: [],
            recommendations: [],
            overallValid: false
        };

        let totalScore = 0;
        const allIssues = new Set();
        const allRecommendations = new Set();

        results.forEach(result => {
            if (result.success && result.data) {
                if (result.data.is_valid) {
                    summary.validPhotos++;
                } else {
                    summary.invalidPhotos++;
                }

                totalScore += result.data.score || 0;

                // Collect issues and recommendations
                if (result.data.issues) {
                    result.data.issues.forEach(issue => allIssues.add(issue));
                }
                if (result.data.recommendations) {
                    result.data.recommendations.forEach(rec => allRecommendations.add(rec));
                }
            }
        });

        summary.averageScore = summary.totalPhotos > 0 ? totalScore / summary.totalPhotos : 0;
        summary.issues = Array.from(allIssues);
        summary.recommendations = Array.from(allRecommendations);
        summary.overallValid = summary.validPhotos === summary.totalPhotos && summary.averageScore >= 70;

        return summary;
    }

    /**
     * Generate verification report for user
     */
    generateVerificationReport(summary, taskDetails) {
        const report = {
            timestamp: new Date().toISOString(),
            taskId: taskDetails.taskId,
            taskType: taskDetails.taskType,
            overallResult: summary.overallValid ? 'APPROVED' : 'REJECTED',
            score: summary.averageScore,
            summary: {
                totalPhotos: summary.totalPhotos,
                validPhotos: summary.validPhotos,
                invalidPhotos: summary.invalidPhotos
            },
            issues: summary.issues,
            recommendations: summary.recommendations,
            nextSteps: this._getNextSteps(summary, taskDetails)
        };

        return report;
    }

    /**
     * Get next steps based on verification results
     */
    _getNextSteps(summary, taskDetails) {
        if (summary.overallValid) {
            return [
                'Photos verified successfully',
                'Task submission approved',
                'Points will be awarded shortly'
            ];
        } else {
            const steps = ['Please address the following issues:'];
            
            if (summary.issues.length > 0) {
                summary.issues.forEach(issue => {
                    steps.push(`• ${issue}`);
                });
            }
            
            if (summary.recommendations.length > 0) {
                steps.push('Recommendations:');
                summary.recommendations.forEach(rec => {
                    steps.push(`• ${rec}`);
                });
            }
            
            steps.push('Resubmit with corrected photos');
            
            return steps;
        }
    }
}
