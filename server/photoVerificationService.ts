/**
 * Photo Verification Service Integration
 * Connects Node.js backend with Python verification service
 */

import axios, { type AxiosRequestConfig, type AxiosResponse } from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

type ServiceConfig = {
  baseUrl?: string;
  timeout?: number;
  maxRetries?: number;
};

type VerificationData = {
  taskType: string;
  location: { lat: number; lng: number };
  locationRadius?: number;
  deadlineStart: string;
  deadlineEnd: string;
  userId: string;
  requiresVideo?: boolean;
};

export class PhotoVerificationService {
  private baseUrl: string;
  private timeout: number;
  private maxRetries: number;

  constructor(config: ServiceConfig = {}) {
    this.baseUrl = config.baseUrl || 'http://localhost:8000';
    this.timeout = config.timeout ?? 30000;
    this.maxRetries = config.maxRetries ?? 3;
  }

  /**
   * Verify a single photo
   */
  async verifyPhoto(filePath: string, verificationData: VerificationData): Promise<{ success: boolean; data?: any; error?: string; filename?: string }>{
    try {
      const formData = new FormData();
      // Add the image file
      formData.append('file', fs.createReadStream(filePath));
      // Add verification parameters
      formData.append('task_type', verificationData.taskType);
      formData.append('location_lat', String(verificationData.location.lat));
      formData.append('location_lng', String(verificationData.location.lng));
      formData.append('location_radius', String(verificationData.locationRadius ?? 100));
      formData.append('deadline_start', verificationData.deadlineStart);
      formData.append('deadline_end', verificationData.deadlineEnd);
      formData.append('user_id', verificationData.userId);
      formData.append('requires_video', String(verificationData.requiresVideo ?? false));

      const response = await this._makeRequest('/verify-photo', formData, {
        headers: {
          ...(formData as any).getHeaders?.(),
        },
      });

      return {
        success: true,
        data: response.data,
        filename: path.basename(filePath),
      };
    } catch (error: any) {
      console.error('Photo verification failed:', error);
      return {
        success: false,
        error: error.message,
        filename: path.basename(filePath),
      };
    }
  }

  /**
   * Verify multiple photos
   */
  async verifyMultiplePhotos(filePaths: string[], verificationData: Omit<VerificationData, 'requiresVideo'>): Promise<{ success: boolean; data?: any; error?: string; totalFiles: number }>{
    try {
      const formData = new FormData();
      // Add all image files
      filePaths.forEach((filePath) => {
        formData.append('files', fs.createReadStream(filePath));
      });
      // Add verification parameters
      formData.append('task_type', verificationData.taskType);
      formData.append('location_lat', String(verificationData.location.lat));
      formData.append('location_lng', String(verificationData.location.lng));
      formData.append('location_radius', String(verificationData.locationRadius ?? 100));
      formData.append('deadline_start', verificationData.deadlineStart);
      formData.append('deadline_end', verificationData.deadlineEnd);
      formData.append('user_id', verificationData.userId);

      const response = await this._makeRequest('/verify-multiple-photos', formData, {
        headers: {
          ...(formData as any).getHeaders?.(),
        },
      });

      return {
        success: true,
        data: response.data,
        totalFiles: filePaths.length,
      };
    } catch (error: any) {
      console.error('Multiple photo verification failed:', error);
      return {
        success: false,
        error: error.message,
        totalFiles: filePaths.length,
      };
    }
  }

  /**
   * Extract metadata from a photo
   */
  async extractMetadata(filePath: string): Promise<{ success: boolean; data?: any; error?: string; filename?: string }>{
    try {
      const formData = new FormData();
      formData.append('file', fs.createReadStream(filePath));

      const response = await this._makeRequest('/extract-metadata', formData, {
        headers: {
          ...(formData as any).getHeaders?.(),
        },
      });

      return {
        success: true,
        data: response.data,
        filename: path.basename(filePath),
      };
    } catch (error: any) {
      console.error('Metadata extraction failed:', error);
      return {
        success: false,
        error: error.message,
        filename: path.basename(filePath),
      };
    }
  }

  /**
   * Check service health
   */
  async checkHealth(): Promise<{ success: boolean; data?: any; error?: string }>{
    try {
      const response = await this._makeRequest('/health');
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Make HTTP request with retry logic
   */
  async _makeRequest(endpoint: string, data: any = null, config: AxiosRequestConfig = {}): Promise<AxiosResponse<any>>{
    let lastError: any;
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const requestConfig: AxiosRequestConfig = {
          method: data ? 'POST' : 'GET',
          url: `${this.baseUrl}${endpoint}`,
          timeout: this.timeout,
          ...config,
        };
        if (data) {
          (requestConfig as any).data = data;
        }
        const response = await axios(requestConfig);
        return response as AxiosResponse<any>;
      } catch (error: any) {
        lastError = error;
        if (attempt === this.maxRetries) {
          throw error;
        }
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));
        console.log(`Attempt ${attempt} failed, retrying in ${delay}ms...`);
      }
    }
    throw lastError;
  }

  /**
   * Process verification results and generate summary
   */
  processVerificationResults(results: any | any[]) {
    if (!Array.isArray(results)) {
      results = [results];
    }

    const summary: any = {
      totalPhotos: results.length,
      validPhotos: 0,
      invalidPhotos: 0,
      averageScore: 0,
      issues: [] as string[],
      recommendations: [] as string[],
      overallValid: false,
    };

    let totalScore = 0;
    const allIssues = new Set<string>();
    const allRecommendations = new Set<string>();

    results.forEach((result: any) => {
      if (result.success && result.data) {
        if (result.data.is_valid) {
          summary.validPhotos++;
        } else {
          summary.invalidPhotos++;
        }
        totalScore += result.data.score || 0;
        if (result.data.issues) {
          (result.data.issues as string[]).forEach((issue) => allIssues.add(issue));
        }
        if (result.data.recommendations) {
          (result.data.recommendations as string[]).forEach((rec) => allRecommendations.add(rec));
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
  generateVerificationReport(summary: any, taskDetails: any) {
    const report = {
      timestamp: new Date().toISOString(),
      taskId: taskDetails.taskId,
      taskType: taskDetails.taskType,
      overallResult: summary.overallValid ? 'APPROVED' : 'REJECTED',
      score: summary.averageScore,
      summary: {
        totalPhotos: summary.totalPhotos,
        validPhotos: summary.validPhotos,
        invalidPhotos: summary.invalidPhotos,
      },
      issues: summary.issues,
      recommendations: summary.recommendations,
      nextSteps: this._getNextSteps(summary, taskDetails),
    };
    return report;
  }

  /**
   * Get next steps based on verification results
   */
  _getNextSteps(summary: any, taskDetails: any) {
    if (summary.overallValid) {
      return [
        'Photos verified successfully',
        'Task submission approved',
        'Points will be awarded shortly',
      ];
    } else {
      const steps: string[] = ['Please address the following issues:'];
      if (summary.issues.length > 0) {
        summary.issues.forEach((issue: string) => {
          steps.push(`• ${issue}`);
        });
      }
      if (summary.recommendations.length > 0) {
        steps.push('Recommendations:');
        summary.recommendations.forEach((rec: string) => {
          steps.push(`• ${rec}`);
        });
      }
      steps.push('Resubmit with corrected photos');
      return steps;
    }
  }
}
