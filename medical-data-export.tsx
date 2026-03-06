import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, FileText, Calendar, Share2, Hospital } from 'lucide-react';
import type { HealthJournalEntry } from '@shared/schema';

interface MedicalDataExportProps {
  entries: HealthJournalEntry[];
  onClose: () => void;
}

interface ExportFormat {
  id: string;
  name: string;
  description: string;
  fileExtension: string;
  icon: any;
  isStandard: boolean;
}

const exportFormats: ExportFormat[] = [
  {
    id: 'fhir',
    name: 'FHIR R4',
    description: 'HL7 FHIR standard for healthcare interoperability',
    fileExtension: 'json',
    icon: Hospital,
    isStandard: true
  },
  {
    id: 'cda',
    name: 'CDA Document',
    description: 'Clinical Document Architecture XML format',
    fileExtension: 'xml',
    icon: FileText,
    isStandard: true
  },
  {
    id: 'csv',
    name: 'CSV Spreadsheet',
    description: 'Comma-separated values for analysis',
    fileExtension: 'csv',
    icon: FileText,
    isStandard: false
  },
  {
    id: 'pdf',
    name: 'PDF Report',
    description: 'Formatted medical report for printing',
    fileExtension: 'pdf',
    icon: FileText,
    isStandard: false
  }
];

export function MedicalDataExport({ entries, onClose }: MedicalDataExportProps) {
  const [selectedFormat, setSelectedFormat] = useState<string>('fhir');
  const [isExporting, setIsExporting] = useState(false);

  const generateFHIRBundle = (entries: HealthJournalEntry[]) => {
    const bundle = {
      resourceType: 'Bundle',
      id: `nekah-health-journal-${Date.now()}`,
      type: 'collection',
      timestamp: new Date().toISOString(),
      entry: entries.map(entry => ({
        resource: {
          resourceType: 'Observation',
          id: entry.id,
          status: 'final',
          category: [
            {
              coding: [
                {
                  system: 'http://terminology.hl7.org/CodeSystem/observation-category',
                  code: 'survey',
                  display: 'Survey'
                }
              ]
            }
          ],
          code: {
            coding: [
              {
                system: 'http://loinc.org',
                code: '72133-2',
                display: 'Health assessment'
              }
            ]
          },
          subject: {
            reference: `Patient/${entry.userId}`
          },
          effectiveDateTime: entry.entryDate,
          valueString: entry.notes,
          component: [
            {
              code: {
                coding: [
                  {
                    system: 'http://snomed.info/sct',
                    code: '418799008',
                    display: 'Symptom'
                  }
                ]
              },
              valueString: entry.symptoms.join(', ')
            },
            {
              code: {
                coding: [
                  {
                    system: 'http://snomed.info/sct',
                    code: '272379006',
                    display: 'Severity'
                  }
                ]
              },
              valueString: entry.severity
            },
            {
              code: {
                coding: [
                  {
                    system: 'http://snomed.info/sct',
                    code: '285854004',
                    display: 'Mood'
                  }
                ]
              },
              valueString: entry.mood || 'not-specified'
            }
          ]
        }
      }))
    };

    return JSON.stringify(bundle, null, 2);
  };

  const generateCSV = (entries: HealthJournalEntry[]) => {
    const headers = [
      'Date',
      'Title',
      'Symptoms',
      'Severity',
      'Mood',
      'Sleep Hours',
      'Water Intake (ml)',
      'Exercise Minutes',
      'Notes',
      'Shared'
    ];

    const rows = entries.map(entry => [
      entry.entryDate,
      entry.title,
      entry.symptoms.join('; '),
      entry.severity,
      entry.mood || '',
      entry.sleepHours || '',
      entry.waterIntake || '',
      entry.exerciseMinutes || '',
      entry.notes || '',
      entry.isShared ? 'Yes' : 'No'
    ]);

    return [headers, ...rows].map(row => 
      row.map(cell => `"${cell}"`).join(',')
    ).join('\n');
  };

  const generateCDA = (entries: HealthJournalEntry[]) => {
    const cdaDocument = `<?xml version="1.0" encoding="UTF-8"?>
<ClinicalDocument xmlns="urn:hl7-org:v3">
  <typeId root="2.16.840.1.113883.1.3" extension="POCD_HD000040"/>
  <templateId root="2.16.840.1.113883.10.20.22.1.1"/>
  <id root="${crypto.randomUUID()}"/>
  <code code="34133-9" codeSystem="2.16.840.1.113883.6.1" displayName="Summarization of Episode Note"/>
  <title>NEKAH Health Journal Summary</title>
  <effectiveTime value="${new Date().toISOString().slice(0, 10).replace(/-/g, '')}"/>
  <confidentialityCode code="N" codeSystem="2.16.840.1.113883.5.25"/>
  <recordTarget>
    <patientRole>
      <id extension="patient-id"/>
      <patient>
        <name>
          <given>Patient</given>
          <family>Name</family>
        </name>
      </patient>
    </patientRole>
  </recordTarget>
  <component>
    <structuredBody>
      <component>
        <section>
          <templateId root="2.16.840.1.113883.10.20.22.2.65"/>
          <code code="8648-8" codeSystem="2.16.840.1.113883.6.1" displayName="Hospital Course"/>
          <title>Health Journal Entries</title>
          <text>
            <table border="1">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Symptoms</th>
                  <th>Severity</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                ${entries.map(entry => `
                <tr>
                  <td>${entry.entryDate}</td>
                  <td>${entry.symptoms.join(', ')}</td>
                  <td>${entry.severity}</td>
                  <td>${entry.notes || 'No additional notes'}</td>
                </tr>
                `).join('')}
              </tbody>
            </table>
          </text>
        </section>
      </component>
    </structuredBody>
  </component>
</ClinicalDocument>`;

    return cdaDocument;
  };

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      let content: string;
      let mimeType: string;
      const format = exportFormats.find(f => f.id === selectedFormat)!;

      switch (selectedFormat) {
        case 'fhir':
          content = generateFHIRBundle(entries);
          mimeType = 'application/json';
          break;
        case 'cda':
          content = generateCDA(entries);
          mimeType = 'application/xml';
          break;
        case 'csv':
          content = generateCSV(entries);
          mimeType = 'text/csv';
          break;
        default:
          throw new Error('Unsupported format');
      }

      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `nekah-health-journal-${Date.now()}.${format.fileExtension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Export Health Data</h3>
              <p className="text-sm text-gray-600">{entries.length} entries ready for export</p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ✕
            </Button>
          </div>

          <div className="space-y-4 mb-6">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Choose Export Format</h4>
              <div className="space-y-2">
                {exportFormats.map(format => {
                  const Icon = format.icon;
                  return (
                    <Card
                      key={format.id}
                      className={`cursor-pointer transition-colors ${
                        selectedFormat === format.id
                          ? 'border-teal-500 bg-teal-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedFormat(format.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            format.isStandard ? 'bg-green-100' : 'bg-blue-100'
                          }`}>
                            <Icon className={`w-4 h-4 ${
                              format.isStandard ? 'text-green-600' : 'text-blue-600'
                            }`} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h5 className="font-medium text-gray-800">{format.name}</h5>
                              {format.isStandard && (
                                <Badge className="bg-green-100 text-green-700 text-xs">
                                  Medical Standard
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">{format.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <Hospital className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-800">Healthcare Integration</p>
                  <p className="text-sm text-blue-700">
                    FHIR and CDA formats are recognized by most electronic health record systems and can be directly imported by healthcare providers.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex space-x-3">
            <Button
              onClick={handleExport}
              disabled={isExporting}
              className="flex-1"
            >
              {isExporting ? (
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
              ) : (
                <Download className="w-4 h-4 mr-2" />
              )}
              {isExporting ? 'Exporting...' : 'Export Data'}
            </Button>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}