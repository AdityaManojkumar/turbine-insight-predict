import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, RotateCcw, Download } from 'lucide-react';
import { turbineApi } from '@/services/api';
import { TurbineParameters } from './ParameterControls';
import { toast } from '@/hooks/use-toast';

interface RealTimeDashboardProps {
  parameters: TurbineParameters;
  onParametersChange: (params: TurbineParameters) => void;
}

interface PredictionHistory {
  id: string;
  timestamp: string;
  prediction: 'normal' | 'warning' | 'fault';
  probability: number;
  confidence: number;
  parameters: TurbineParameters;
}

export default function RealTimeDashboard({ parameters, onParametersChange }: RealTimeDashboardProps) {
  const [isRealTimeMode, setIsRealTimeMode] = useState(false);
  const [predictionHistory, setPredictionHistory] = useState<PredictionHistory[]>([]);
  const [lastPrediction, setLastPrediction] = useState<any>(null);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);

  // Real-time simulation - generates realistic parameter variations
  const simulateRealTimeData = () => {
    const newParams = { ...parameters };
    
    // Simulate wind variations
    newParams.windSpeed = Math.max(0, newParams.windSpeed + (Math.random() - 0.5) * 2);
    
    // Simulate temperature changes
    newParams.componentTemperatures = Math.max(0, newParams.componentTemperatures + (Math.random() - 0.5) * 5);
    
    // Simulate vibration fluctuations
    newParams.vibrationLevels = Math.max(0, newParams.vibrationLevels + (Math.random() - 0.5) * 10);
    
    // Simulate power generation based on wind
    newParams.generatorPower = Math.max(0, newParams.windSpeed * 150 + (Math.random() - 0.5) * 200);
    
    // Simulate other parameters with small variations
    newParams.powerFactor = Math.max(0.5, Math.min(1, newParams.powerFactor + (Math.random() - 0.5) * 0.1));
    newParams.frequency = Math.max(45, Math.min(65, newParams.frequency + (Math.random() - 0.5) * 1));
    
    onParametersChange(newParams);
    
    // Auto-predict in real-time mode
    runPrediction(newParams);
  };

  const runPrediction = async (params: TurbineParameters) => {
    try {
      const result = await turbineApi.predict(params);
      setLastPrediction(result);
      
      // Add to history
      const historyEntry: PredictionHistory = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        prediction: result.prediction,
        probability: result.probability,
        confidence: result.confidence,
        parameters: { ...params }
      };
      
      setPredictionHistory(prev => [historyEntry, ...prev.slice(0, 49)]); // Keep last 50 entries
    } catch (error) {
      console.error('Prediction failed:', error);
    }
  };

  const startRealTimeMode = () => {
    setIsRealTimeMode(true);
    const id = setInterval(simulateRealTimeData, 3000); // Update every 3 seconds
    setIntervalId(id);
    
    toast({
      title: "Real-time mode activated",
      description: "Continuous monitoring and prediction started",
    });
  };

  const stopRealTimeMode = () => {
    setIsRealTimeMode(false);
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
    
    toast({
      title: "Real-time mode deactivated",
      description: "Continuous monitoring stopped",
    });
  };

  const clearHistory = () => {
    setPredictionHistory([]);
    toast({
      title: "History cleared",
      description: "All prediction history has been cleared",
    });
  };

  const exportHistory = () => {
    const csv = [
      ['Timestamp', 'Prediction', 'Probability', 'Confidence', 'Wind Speed', 'Generator Power', 'Vibration', 'Temperature'],
      ...predictionHistory.map(entry => [
        entry.timestamp,
        entry.prediction,
        entry.probability.toFixed(3),
        entry.confidence.toFixed(3),
        entry.parameters.windSpeed.toFixed(1),
        entry.parameters.generatorPower.toFixed(1),
        entry.parameters.vibrationLevels.toFixed(1),
        entry.parameters.componentTemperatures.toFixed(1)
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `turbine_predictions_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    
    toast({
      title: "History exported",
      description: "Prediction history downloaded as CSV",
    });
  };

  useEffect(() => {
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [intervalId]);

  const getStatusColor = (prediction: string) => {
    switch (prediction) {
      case 'fault': return 'bg-destructive';
      case 'warning': return 'bg-yellow-500';
      default: return 'bg-secondary';
    }
  };

  return (
    <div className="space-y-6">
      {/* Real-time Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Real-time Monitoring
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Live Mode</span>
              <Switch
                checked={isRealTimeMode}
                onCheckedChange={isRealTimeMode ? stopRealTimeMode : startRealTimeMode}
              />
            </div>
          </CardTitle>
          <CardDescription>
            Continuous turbine monitoring with automated fault prediction
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={isRealTimeMode ? stopRealTimeMode : startRealTimeMode}
              className="flex items-center gap-2"
            >
              {isRealTimeMode ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isRealTimeMode ? 'Pause' : 'Start'} Monitoring
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={clearHistory}
              className="flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Clear History
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={exportHistory}
              disabled={predictionHistory.length === 0}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Current Status */}
      {lastPrediction && (
        <Card className="border-2" style={{ borderColor: `hsl(var(--${lastPrediction.prediction === 'fault' ? 'destructive' : lastPrediction.prediction === 'warning' ? 'yellow-500' : 'secondary'}))` }}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Current Status
              <Badge className={`${getStatusColor(lastPrediction.prediction)} text-white`}>
                {lastPrediction.prediction.toUpperCase()}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-2xl font-bold">{(lastPrediction.probability * 100).toFixed(1)}%</div>
                <div className="text-sm text-muted-foreground">Fault Probability</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{(lastPrediction.confidence * 100).toFixed(1)}%</div>
                <div className="text-sm text-muted-foreground">Confidence</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Prediction History */}
      <Card>
        <CardHeader>
          <CardTitle>Prediction History ({predictionHistory.length})</CardTitle>
          <CardDescription>
            Recent fault predictions with timestamps
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {predictionHistory.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                No predictions yet. Start real-time monitoring to begin collecting data.
              </div>
            ) : (
              predictionHistory.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(entry.prediction)}`} />
                    <div>
                      <div className="font-medium capitalize">{entry.prediction}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(entry.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {(entry.probability * 100).toFixed(1)}%
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Wind: {entry.parameters.windSpeed.toFixed(1)} m/s
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}