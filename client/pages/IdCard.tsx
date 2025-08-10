import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/Navigation";
import { useCivitasStore } from "@/lib/store";
import { 
  Download, Copy, Check, Share2, Printer, QrCode,
  Shield, Award, MapPin, Calendar, User, Phone, Mail
} from "lucide-react";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function IdCard() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useCivitasStore();
  const [copied, setCopied] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated || !user) {
    return null;
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const generatePDF = async () => {
    if (!cardRef.current) return;
    
    setIsGeneratingPdf(true);
    try {
      // Create a specialized container for PDF generation
      const pdfContainer = document.createElement('div');
      pdfContainer.style.position = 'absolute';
      pdfContainer.style.left = '-9999px';
      pdfContainer.style.top = '0';
      pdfContainer.style.width = '1000px';
      pdfContainer.style.backgroundColor = '#ffffff';
      pdfContainer.style.fontFamily = 'system-ui, -apple-system, sans-serif';
      document.body.appendChild(pdfContainer);

      // Clone the card content
      const cardClone = cardRef.current.cloneNode(true) as HTMLElement;
      cardClone.style.width = '1000px';
      cardClone.style.maxWidth = '1000px';
      cardClone.style.transform = 'none';
      cardClone.style.margin = '0';
      
      // Remove buttons and interactive elements from clone
      const buttons = cardClone.querySelectorAll('button');
      buttons.forEach(btn => btn.style.display = 'none');

      pdfContainer.appendChild(cardClone);

      // Wait for fonts and layout
      await new Promise(resolve => setTimeout(resolve, 500));

      const canvas = await html2canvas(pdfContainer, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: 1000,
        height: pdfContainer.scrollHeight,
        scrollX: 0,
        scrollY: 0,
        logging: false
      });

      // Clean up
      document.body.removeChild(pdfContainer);

      const imgData = canvas.toDataURL('image/png', 1.0);
      
      // Create PDF with fixed A4 landscape format
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      // A4 landscape dimensions: 297mm x 210mm
      const pageWidth = 297;
      const pageHeight = 210;
      const margin = 15;
      
      // Calculate image dimensions to fit the page
      const maxWidth = pageWidth - (2 * margin);
      const maxHeight = pageHeight - (2 * margin);
      
      const imgWidth = maxWidth;
      const imgHeight = (canvas.height * maxWidth) / canvas.width;
      
      // Center the image
      const x = margin;
      const y = (pageHeight - imgHeight) / 2;

      pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight, undefined, 'FAST');
      pdf.save(`Civitas-ID-Card-${user.citizenId}.pdf`);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const printCard = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const cardHTML = cardRef.current?.innerHTML || '';
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Civitas ID Card - ${user.citizenId}</title>
          <style>
            @page { 
              size: A4 landscape; 
              margin: 15mm; 
            }
            * { 
              margin: 0; 
              padding: 0; 
              box-sizing: border-box; 
            }
            body { 
              font-family: system-ui, -apple-system, sans-serif;
              background: white;
              color: black;
              line-height: 1.4;
            }
            .card-container {
              width: 100%;
              max-width: 1000px;
              margin: 0 auto;
              background: white;
              border: 2px solid #1e40af;
              border-radius: 12px;
              overflow: hidden;
            }
            .header {
              background: linear-gradient(to right, #1e40af, #dc2626, #1e40af);
              color: white;
              padding: 20px;
            }
            .header-content {
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .emblem {
              width: 60px;
              height: 60px;
              background: #eab308;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              margin-right: 20px;
            }
            .emblem-inner {
              width: 40px;
              height: 40px;
              background: #1e40af;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              color: #eab308;
              font-weight: bold;
              font-size: 16px;
            }
            .gov-info h2 {
              font-size: 20px;
              font-weight: bold;
              margin-bottom: 5px;
            }
            .gov-info p {
              font-size: 12px;
              margin-bottom: 3px;
            }
            .civitas-brand h3 {
              font-size: 24px;
              font-weight: bold;
              color: #eab308;
            }
            .civitas-brand p {
              font-size: 12px;
            }
            .content {
              padding: 30px;
            }
            .grid {
              display: grid;
              grid-template-columns: 1fr 1fr 1fr;
              gap: 30px;
            }
            .photo-section {
              text-align: center;
            }
            .photo {
              width: 120px;
              height: 150px;
              background: linear-gradient(to bottom, #e5e7eb, #d1d5db);
              border: 2px solid #1e40af;
              border-radius: 8px;
              margin: 0 auto 20px;
              display: flex;
              align-items: center;
              justify-content: center;
              color: #6b7280;
              font-size: 48px;
            }
            .qr-code {
              width: 80px;
              height: 80px;
              background: #1e40af;
              border-radius: 8px;
              margin: 0 auto 10px;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-size: 32px;
            }
            .section-title {
              font-size: 18px;
              font-weight: bold;
              color: #1e40af;
              border-bottom: 2px solid #eab308;
              padding-bottom: 8px;
              margin-bottom: 20px;
            }
            .detail-item {
              margin-bottom: 15px;
            }
            .detail-label {
              font-size: 11px;
              font-weight: bold;
              color: #6b7280;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              margin-bottom: 3px;
            }
            .detail-value {
              font-size: 14px;
              color: #1e40af;
              font-weight: 600;
            }
            .citizen-id {
              font-family: monospace;
              font-size: 16px;
              font-weight: bold;
              background: #f3f4f6;
              padding: 8px 12px;
              border-radius: 4px;
              border: 1px solid #d1d5db;
              letter-spacing: 1px;
            }
            .stats-card {
              background: #f0fdf4;
              border: 1px solid #16a34a;
              border-radius: 8px;
              padding: 15px;
              text-align: center;
              margin-bottom: 15px;
            }
            .stats-title {
              font-size: 11px;
              font-weight: bold;
              color: #16a34a;
              text-transform: uppercase;
              margin-bottom: 5px;
            }
            .stats-value {
              font-size: 20px;
              font-weight: bold;
              color: #16a34a;
            }
            .small-stats {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 10px;
              margin-bottom: 15px;
            }
            .small-stat {
              background: #f1f5f9;
              border: 1px solid #1e40af;
              border-radius: 6px;
              padding: 10px;
              text-align: center;
            }
            .small-stat-title {
              font-size: 10px;
              font-weight: bold;
              color: #1e40af;
              text-transform: uppercase;
              margin-bottom: 3px;
            }
            .small-stat-value {
              font-size: 16px;
              font-weight: bold;
              color: #1e40af;
            }
            .progress-bar {
              background: #e5e7eb;
              height: 8px;
              border-radius: 4px;
              overflow: hidden;
              margin-top: 5px;
            }
            .progress-fill {
              background: #eab308;
              height: 100%;
              width: ${user.successRate}%;
            }
            .badges {
              display: flex;
              gap: 8px;
              flex-wrap: wrap;
            }
            .badge {
              background: #16a34a;
              color: white;
              padding: 4px 8px;
              border-radius: 4px;
              font-size: 10px;
              font-weight: bold;
            }
            .footer {
              border-top: 2px solid #e5e7eb;
              padding-top: 20px;
              margin-top: 20px;
              display: flex;
              justify-content: space-between;
              align-items: center;
              font-size: 11px;
              color: #6b7280;
            }
            .footer-right {
              text-align: right;
            }
            .footer-right p:first-child {
              font-weight: bold;
              color: #1e40af;
            }
            button { display: none !important; }
          </style>
        </head>
        <body>
          <div class="card-container">
            <div class="header">
              <div class="header-content">
                <div style="display: flex; align-items: center;">
                  <div class="emblem">
                    <div class="emblem-inner">⚖</div>
                  </div>
                  <div class="gov-info">
                    <h2>GOVERNMENT OF INDIA</h2>
                    <p>Ministry of Electronics & Information Technology</p>
                    <p style="color: #eab308; font-weight: bold;">DIGITAL INDIA INITIATIVE</p>
                  </div>
                </div>
                <div class="civitas-brand">
                  <h3>CIVITAS</h3>
                  <p>Citizen Engagement Platform</p>
                </div>
              </div>
            </div>
            
            <div class="content">
              <div class="grid">
                <div class="photo-section">
                  <div class="photo">👤</div>
                  <div class="qr-code">⚪</div>
                  <p style="font-size: 10px; color: #6b7280;">Scan for verification</p>
                </div>
                
                <div>
                  <h3 class="section-title">CITIZEN DETAILS</h3>
                  <div class="detail-item">
                    <div class="detail-label">Citizen ID</div>
                    <div class="detail-value citizen-id">${user.citizenId}</div>
                  </div>
                  <div class="detail-item">
                    <div class="detail-label">Registration Status</div>
                    <div class="detail-value" style="color: #16a34a;">ACTIVE CITIZEN</div>
                  </div>
                  <div class="detail-item">
                    <div class="detail-label">Region</div>
                    <div class="detail-value">${user.region}</div>
                  </div>
                  <div class="detail-item">
                    <div class="detail-label">Contact Info</div>
                    <div class="detail-value" style="font-size: 12px;">
                      ${user.email ? `📧 ${user.email}<br>` : ''}
                      📞 1800-CIVITAS
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 class="section-title">CIVIC RECORD</h3>
                  <div class="stats-card">
                    <div class="stats-title">Total Points</div>
                    <div class="stats-value">${user.points.toLocaleString()}</div>
                  </div>
                  <div class="small-stats">
                    <div class="small-stat">
                      <div class="small-stat-title">Rank</div>
                      <div class="small-stat-value">#${user.rank}</div>
                    </div>
                    <div class="small-stat" style="border-color: #dc2626;">
                      <div class="small-stat-title" style="color: #dc2626;">Tasks</div>
                      <div class="small-stat-value" style="color: #dc2626;">${user.tasksCompleted}</div>
                    </div>
                  </div>
                  <div style="background: #fef3c7; border: 1px solid #eab308; border-radius: 8px; padding: 12px;">
                    <div style="font-size: 11px; font-weight: bold; color: #92400e; text-transform: uppercase; margin-bottom: 8px;">Success Rate</div>
                    <div style="display: flex; align-items: center; gap: 10px;">
                      <div class="progress-bar" style="flex: 1;">
                        <div class="progress-fill"></div>
                      </div>
                      <span style="font-weight: bold; color: #92400e;">${user.successRate}%</span>
                    </div>
                  </div>
                  <div style="margin-top: 15px;">
                    <div style="font-size: 11px; font-weight: bold; color: #6b7280; text-transform: uppercase; margin-bottom: 8px;">Achievements</div>
                    <div class="badges">
                      <span class="badge">🛡️ Verified</span>
                      <span class="badge" style="background: #1e40af;">🏆 Contributor</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="footer">
                <div>📅 Issued: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })}</div>
                <div>📅 Valid Until: ${new Date(Date.now() + 5 * 365 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })}</div>
                <div class="footer-right">
                  <p>digitally verified</p>
                  <p>Government of India</p>
                </div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  const currentDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  const expiryDate = new Date();
  expiryDate.setFullYear(expiryDate.getFullYear() + 5);
  const formattedExpiryDate = expiryDate.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="main-content">
        <div className="py-4 sm:py-6 lg:py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="text-center mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-gov-navy mb-2">Digital Citizen ID Card</h1>
              <p className="text-sm sm:text-base text-gray-600">Official Government of India Civic Engagement Identification</p>
            </div>

            {/* Action Buttons - Mobile Responsive */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 sm:mb-8 no-print">
              <Button
                onClick={() => copyToClipboard(user.citizenId)}
                className="flex items-center justify-center gap-2 bg-gov-navy hover:bg-gov-navy/90 text-white px-4 py-2 text-sm sm:text-base"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy Citizen ID'}
              </Button>
              
              <Button
                onClick={generatePDF}
                disabled={isGeneratingPdf}
                className="flex items-center justify-center gap-2 bg-gov-maroon hover:bg-gov-maroon/90 text-white px-4 py-2 text-sm sm:text-base"
              >
                <Download className="w-4 h-4" />
                {isGeneratingPdf ? 'Generating...' : 'Download PDF'}
              </Button>
              
              <Button
                onClick={printCard}
                variant="outline"
                className="flex items-center justify-center gap-2 border-gov-navy text-gov-navy hover:bg-gov-navy hover:text-white px-4 py-2 text-sm sm:text-base"
              >
                <Printer className="w-4 h-4" />
                Print Card
              </Button>
              
              <Button
                variant="outline"
                className="flex items-center justify-center gap-2 border-gov-gold text-gov-gold hover:bg-gov-gold hover:text-gov-navy px-4 py-2 text-sm sm:text-base"
              >
                <Share2 className="w-4 h-4" />
                Share
              </Button>
            </div>

            {/* ID Card */}
            <div ref={cardRef} className="id-card-container w-full max-w-5xl mx-auto">
              <Card className="w-full bg-white border-2 border-gov-navy shadow-2xl overflow-hidden">
                {/* Government Header */}
                <div className="bg-gradient-to-r from-gov-navy via-gov-maroon to-gov-navy text-white p-6">
                  <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4 text-center lg:text-left">
                      {/* Government Emblem */}
                      <div className="w-16 h-16 bg-gov-gold rounded-full flex items-center justify-center relative flex-shrink-0">
                        <div className="w-10 h-10 bg-gov-navy rounded-full flex items-center justify-center">
                          <span className="text-gov-gold font-bold text-lg">⚖</span>
                        </div>
                      </div>
                      <div>
                        <h2 className="text-xl font-bold">GOVERNMENT OF INDIA</h2>
                        <p className="text-sm text-gray-200">Ministry of Electronics & Information Technology</p>
                        <p className="text-sm text-gov-gold font-semibold">DIGITAL INDIA INITIATIVE</p>
                      </div>
                    </div>
                    <div className="text-center lg:text-right">
                      <h3 className="text-2xl font-bold text-gov-gold">CIVITAS</h3>
                      <p className="text-sm text-gray-200">Citizen Engagement Platform</p>
                    </div>
                  </div>
                </div>

                <CardContent className="p-6 lg:p-8">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Citizen Photo & QR */}
                    <div className="text-center space-y-4">
                      {/* Citizen Photo Placeholder */}
                      <div className="w-36 h-44 mx-auto bg-gradient-to-b from-gray-200 to-gray-300 rounded-lg border-2 border-gov-navy flex items-center justify-center">
                        <User className="w-20 h-20 text-gray-500" />
                      </div>
                      
                      {/* QR Code Placeholder */}
                      <div className="w-24 h-24 mx-auto bg-gov-navy rounded-lg flex items-center justify-center">
                        <QrCode className="w-14 h-14 text-white" />
                      </div>
                      <p className="text-xs text-gray-600">Scan for verification</p>
                    </div>

                    {/* Middle Column - Citizen Details */}
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-xl font-bold text-gov-navy mb-4 border-b-2 border-gov-gold pb-2">
                          CITIZEN DETAILS
                        </h3>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide block mb-1">Citizen ID</label>
                          <div className="flex items-center gap-2">
                            <div className="text-xl font-bold text-gov-navy font-mono tracking-wider bg-gray-100 px-3 py-2 rounded border flex-1">
                              {user.citizenId}
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => copyToClipboard(user.citizenId)}
                              className="p-1 h-8 w-8 no-print"
                            >
                              {copied ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
                            </Button>
                          </div>
                        </div>

                        <div>
                          <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide block mb-1">Registration Status</label>
                          <p className="text-base text-gov-green font-semibold">ACTIVE CITIZEN</p>
                        </div>

                        <div>
                          <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide block mb-1">Region</label>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4 text-gov-navy" />
                            <p className="text-base text-gov-navy font-medium">{user.region}</p>
                          </div>
                        </div>

                        <div>
                          <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide block mb-1">Contact Info</label>
                          <div className="space-y-1">
                            {user.email && (
                              <div className="flex items-center gap-1">
                                <Mail className="w-4 h-4 text-gov-navy" />
                                <p className="text-sm text-gov-navy">{user.email}</p>
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <Phone className="w-4 h-4 text-gov-navy" />
                              <p className="text-sm text-gov-navy">1800-CIVITAS</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Column - Stats & Achievements */}
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-xl font-bold text-gov-navy mb-4 border-b-2 border-gov-gold pb-2">
                          CIVIC RECORD
                        </h3>
                      </div>

                      <div className="space-y-4">
                        <div className="bg-gov-green/10 border border-gov-green rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-semibold text-gov-green uppercase">Total Points</p>
                              <p className="text-2xl font-bold text-gov-green">{user.points.toLocaleString()}</p>
                            </div>
                            <Award className="w-8 h-8 text-gov-green" />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-gov-navy/10 border border-gov-navy rounded-lg p-3 text-center">
                            <p className="text-xs font-semibold text-gov-navy uppercase">Rank</p>
                            <p className="text-xl font-bold text-gov-navy">#{user.rank}</p>
                          </div>
                          <div className="bg-gov-maroon/10 border border-gov-maroon rounded-lg p-3 text-center">
                            <p className="text-xs font-semibold text-gov-maroon uppercase">Tasks</p>
                            <p className="text-xl font-bold text-gov-maroon">{user.tasksCompleted}</p>
                          </div>
                        </div>

                        <div className="bg-gov-gold/10 border border-gov-gold rounded-lg p-4">
                          <p className="text-sm font-semibold text-gov-gold uppercase mb-2">Success Rate</p>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-gov-gold h-2 rounded-full transition-all duration-500"
                                style={{ width: `${user.successRate}%` }}
                              ></div>
                            </div>
                            <span className="text-base font-bold text-gov-gold">{user.successRate}%</span>
                          </div>
                        </div>

                        {/* Badges */}
                        <div>
                          <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">Achievements</p>
                          <div className="flex flex-wrap gap-2">
                            <Badge className="bg-gov-green text-white text-xs">
                              <Shield className="w-3 h-3 mr-1" />
                              Verified
                            </Badge>
                            <Badge className="bg-gov-navy text-white text-xs">
                              <Award className="w-3 h-3 mr-1" />
                              Contributor
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="mt-8 pt-6 border-t-2 border-gray-200">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>Issued: {currentDate}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>Valid Until: {formattedExpiryDate}</span>
                      </div>
                      <div className="text-center">
                        <p className="font-semibold text-gov-navy">digitally verified</p>
                        <p>Government of India</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Security Notice */}
            <div className="mt-8 max-w-5xl mx-auto no-print">
              <Card className="border border-blue-200 bg-blue-50">
                <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    <Shield className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-blue-800 mb-2">Security & Privacy</h4>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>• This ID card maintains your complete anonymity while verifying your civic participation</li>
                        <li>• Your personal information is not stored or accessible to third parties</li>
                        <li>• Use this ID for all Civitas platform activities and verifications</li>
                        <li>• Contact support at 1800-CIVITAS for any assistance</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
