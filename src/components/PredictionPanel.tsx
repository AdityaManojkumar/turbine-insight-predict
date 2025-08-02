import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, CheckCircle, Zap, TrendingUp } from 'lucide-react';
import { TurbineParameters } from './ParameterControls';

interface PredictionResult {
  prediction: 'normal' | 'warning' | 'fault';
  probability: number;
  confidence: number;
  affectedComponents: string[];
  shapValues?: { [key: string]: number };
  timestamp: string;
}

interface PredictionPanelProps {
  parameters: TurbineParameters;
  prediction: PredictionResult | null;
  isLoading: boolean;
  onPredict: () => void;
}

export default function PredictionPanel({ 
  parameters, 
  prediction, 
  isLoading, 
  onPredict 
}: PredictionPanelProps) {
  const getPredictionIcon = () => {
    if (!prediction) return <Zap className="w-5 h-5" />;
    
    switch (prediction.prediction) {
      case 'fault':
        return <AlertTriangle className="w-5 h-5 text-destructive" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      default:
        return <CheckCircle className="w-5 h-5 text-secondary" />;
    }
  };

  const getPredictionColor = () => {
    if (!prediction) return 'bg-muted';
    
    switch (prediction.prediction) {
      case 'fault':
        return 'bg-destructive';
      case 'warning':
        return 'bg-yellow-500';
      default:
        return 'bg-secondary';
    }
  };

  const getStatusText = () => {
    if (!prediction) return 'No prediction available';
    
    switch (prediction.prediction) {
      case 'fault':
        return 'Fault Detected';
      case 'warning':
        return 'Warning Condition';
      default:
        return 'Normal Operation';
    }
  };

  const formatShapValue = (key: string, value: number) => {
    const parameterNames: { [key: string]: string } = {
      generatorPower: 'Generator Power',
      windSpeed: 'Wind Speed',
      vibrationLevels: 'Vibration Levels',
      componentTemperatures: 'Component Temp',
      powerFactor: 'Power Factor',
      // Add more mappings as needed
    };
    
    return parameterNames[key] || key;
  };

  return (
    <div className="space-y-6">
      {/* Prediction Control */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Fault Prediction
          </CardTitle>
          <CardDescription>
            AI-powered analysis of turbine health status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={onPredict} 
            disabled={isLoading}
            className="w-full bg-gradient-primary hover:opacity-90 transition-opacity"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Analyzing...
              </div>
            ) : (
              'Run Fault Analysis'
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Prediction Results */}
      {prediction && (
        <Card className="border-2" style={{ borderColor: `hsl(var(--${prediction.prediction === 'fault' ? 'destructive' : prediction.prediction === 'warning' ? 'yellow-500' : 'secondary'}))` }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getPredictionIcon()}
              Prediction Results
            </CardTitle>
            <CardDescription>
              Analysis completed at {new Date(prediction.timestamp).toLocaleString()}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Status Badge */}
            <div className="flex items-center justify-between">
              <Badge 
                variant="secondary" 
                className={`${getPredictionColor()} text-white text-lg px-4 py-2`}
              >
                {getStatusText()}
              </Badge>
              <div className="text-right">
                <div className="text-2xl font-bold">{(prediction.probability * 100).toFixed(1)}%</div>
                <div className="text-sm text-muted-foreground">Probability</div>
              </div>
            </div>

            {/* Probability Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Fault Probability</span>
                <span>{(prediction.probability * 100).toFixed(1)}%</span>
              </div>
              <Progress 
                value={prediction.probability * 100} 
                className="h-3"
              />
            </div>

            {/* Confidence */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Model Confidence</span>
                <span>{(prediction.confidence * 100).toFixed(1)}%</span>
              </div>
              <Progress 
                value={prediction.confidence * 100} 
                className="h-3"
              />
            </div>

            {/* Affected Components */}
            {prediction.affectedComponents.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium">Affected Components</h4>
                <div className="flex flex-wrap gap-2">
                  {prediction.affectedComponents.map((component, index) => (
                    <Badge key={index} variant="outline">
                      {component}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* SHAP Values - Feature Importance */}
            {prediction.shapValues && (
              <div className="space-y-3">
                <h4 className="font-medium">Feature Importance (SHAP)</h4>
                <div className="space-y-2">
                  {Object.entries(prediction.shapValues)
                    .sort(([,a], [,b]) => Math.abs(b) - Math.abs(a))
                    .slice(0, 5)
                    .map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between text-sm">
                        <span>{formatShapValue(key, value)}</span>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-16 h-2 rounded-full bg-muted overflow-hidden"
                          >
                            <div 
                              className={`h-full ${value > 0 ? 'bg-destructive' : 'bg-secondary'}`}
                              style={{ width: `${Math.abs(value) * 100}%` }}
                            />
                          </div>
                          <span className={`w-12 text-right ${value > 0 ? 'text-destructive' : 'text-secondary'}`}>
                            {value > 0 ? '+' : ''}{value.toFixed(3)}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Current System Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm">Generator Power</span>
            <span className="text-sm font-medium">{parameters.generatorPower} kW</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">Wind Speed</span>
            <span className="text-sm font-medium">{parameters.windSpeed} m/s</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">Vibration Level</span>
            <span className={`text-sm font-medium ${parameters.vibrationLevels > 50 ? 'text-destructive' : 'text-secondary'}`}>
              {parameters.vibrationLevels} mm/s
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">Component Temp</span>
            <span className={`text-sm font-medium ${parameters.componentTemperatures > 80 ? 'text-destructive' : 'text-secondary'}`}>
              {parameters.componentTemperatures}°C
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}