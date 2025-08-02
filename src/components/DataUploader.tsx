import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileText, Download, Play } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { TurbineParameters } from './ParameterControls';

interface DataUploaderProps {
  onDataLoad: (data: TurbineParameters[]) => void;
  onSingleParameterLoad: (params: TurbineParameters) => void;
}

export default function DataUploader({ onDataLoad, onSingleParameterLoad }: DataUploaderProps) {
  const [uploadedData, setUploadedData] = useState<TurbineParameters[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateSampleData = (): TurbineParameters[] => {
    const scenarios = [
      // Normal operation
      {
        name: 'Normal Operation',
        windSpeed: 12,
        generatorPower: 1800,
        vibrationLevels: 25,
        componentTemperatures: 65,
        powerFactor: 0.95,
        frequency: 50
      },
      // Warning condition
      {
        name: 'High Vibration Warning',
        windSpeed: 15,
        generatorPower: 2200,
        vibrationLevels: 75,
        componentTemperatures: 85,
        powerFactor: 0.88,
        frequency: 49.5
      },
      // Fault condition
      {
        name: 'Overheating Fault',
        windSpeed: 8,
        generatorPower: 1200,
        vibrationLevels: 45,
        componentTemperatures: 125,
        powerFactor: 0.75,
        frequency: 48.2
      },
      // Low wind condition
      {
        name: 'Low Wind Speed',
        windSpeed: 3,
        generatorPower: 200,
        vibrationLevels: 15,
        componentTemperatures: 45,
        powerFactor: 0.92,
        frequency: 50.2
      },
      // High wind condition
      {
        name: 'High Wind Speed',
        windSpeed: 25,
        generatorPower: 3500,
        vibrationLevels: 85,
        componentTemperatures: 95,
        powerFactor: 0.85,
        frequency: 51.1
      }
    ];

    return scenarios.map((scenario, index) => ({
      // Electrical Parameters
      generatorPower: scenario.generatorPower,
      voltage: 690,
      current: scenario.generatorPower / 690 * 1.5,
      frequency: scenario.frequency,
      powerFactor: scenario.powerFactor,

      // Wind & Environmental Parameters
      windSpeed: scenario.windSpeed,
      windDirection: 180 + Math.random() * 40 - 20,
      turbulenceIntensity: 10 + Math.random() * 10,
      airDensity: 1.225,
      temperature: 20 + Math.random() * 10,
      pressure: 1013,
      humidity: 60 + Math.random() * 20,

      // Performance Parameters
      tipSpeedRatio: 7.5,
      coefficientPerformance: 0.45,
      powerCurve: 85,
      capacityFactor: scenario.generatorPower / 5000 * 100,

      // Control Parameters
      cutInWindSpeed: 3,
      ratedWindSpeed: 12,
      cutOutWindSpeed: 25,
      brakingSystemType: 'aerodynamic',

      // Health Monitoring Parameters
      vibrationLevels: scenario.vibrationLevels,
      componentTemperatures: scenario.componentTemperatures,
      gearboxOilCondition: 85 - Math.random() * 20,
      noiseLevels: 65 + Math.random() * 10,

      // Structural Parameters
      towerType: 'tubular',
      materialProperties: 95,
      foundationType: 'gravity'
    }));
  };

  const downloadSampleCSV = () => {
    const sampleData = generateSampleData();
    const headers = Object.keys(sampleData[0]).join(',');
    const rows = sampleData.map(row => Object.values(row).join('\n')).join('\n');
    const csv = headers + '\n' + rows;

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'turbine_sample_data.csv';
    a.click();

    toast({
      title: "Sample data downloaded",
      description: "CSV template with sample turbine data",
    });
  };

  const loadSampleData = () => {
    const sampleData = generateSampleData();
    setUploadedData(sampleData);
    onDataLoad(sampleData);

    toast({
      title: "Sample data loaded",
      description: `Loaded ${sampleData.length} sample scenarios`,
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast({
        title: "Invalid file type",
        description: "Please upload a CSV file",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        throw new Error('File must contain headers and at least one data row');
      }

      const headers = lines[0].split(',').map(h => h.trim());
      const data: TurbineParameters[] = [];

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        if (values.length !== headers.length) continue;

        const row: any = {};
        headers.forEach((header, index) => {
          const value = values[index];
          // Try to parse as number, otherwise keep as string
          row[header] = isNaN(Number(value)) ? value : Number(value);
        });

        data.push(row as TurbineParameters);
      }

      setUploadedData(data);
      onDataLoad(data);

      toast({
        title: "Data uploaded successfully",
        description: `Loaded ${data.length} turbine parameter sets`,
      });

    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to parse CSV file",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const loadParameterSet = (index: number) => {
    if (uploadedData[index]) {
      onSingleParameterLoad(uploadedData[index]);
      toast({
        title: "Parameters loaded",
        description: `Loaded parameter set #${index + 1}`,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Data Upload & Management
          </CardTitle>
          <CardDescription>
            Upload CSV files or use sample data for batch analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
              className="flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              {isProcessing ? 'Processing...' : 'Upload CSV'}
            </Button>
            
            <Button
              variant="outline"
              onClick={downloadSampleCSV}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download Template
            </Button>
            
            <Button
              variant="outline"
              onClick={loadSampleData}
              className="flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              Load Sample Data
            </Button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="hidden"
          />

          <div className="text-sm text-muted-foreground">
            <p>CSV should contain columns for all turbine parameters:</p>
            <p className="mt-1">generatorPower, windSpeed, vibrationLevels, componentTemperatures, etc.</p>
          </div>
        </CardContent>
      </Card>

      {/* Uploaded Data Preview */}
      {uploadedData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Uploaded Data ({uploadedData.length} sets)</CardTitle>
            <CardDescription>
              Click any row to load those parameters for analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {uploadedData.map((params, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => loadParameterSet(index)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-xs font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium">Parameter Set #{index + 1}</div>
                      <div className="text-xs text-muted-foreground">
                        Wind: {params.windSpeed}m/s, Power: {params.generatorPower}kW
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline">
                      <Play className="w-3 h-3 mr-1" />
                      Load
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
