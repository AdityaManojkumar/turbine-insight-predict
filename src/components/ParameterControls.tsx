import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

export interface TurbineParameters {
  // Electrical Parameters
  generatorPower: number;
  voltage: number;
  current: number;
  frequency: number;
  powerFactor: number;

  // Wind & Environmental Parameters
  windSpeed: number;
  windDirection: number;
  turbulenceIntensity: number;
  airDensity: number;
  temperature: number;
  pressure: number;
  humidity: number;

  // Performance Parameters
  tipSpeedRatio: number;
  coefficientPerformance: number;
  powerCurve: number;
  capacityFactor: number;

  // Control Parameters
  cutInWindSpeed: number;
  ratedWindSpeed: number;
  cutOutWindSpeed: number;
  brakingSystemType: string;

  // Health Monitoring Parameters
  vibrationLevels: number;
  componentTemperatures: number;
  gearboxOilCondition: number;
  noiseLevels: number;

  // Structural Parameters
  towerType: string;
  materialProperties: number;
  foundationType: string;
}

interface ParameterControlsProps {
  parameters: TurbineParameters;
  onParameterChange: (key: keyof TurbineParameters, value: number | string) => void;
}

export default function ParameterControls({ parameters, onParameterChange }: ParameterControlsProps) {
  const renderSliderControl = (
    key: keyof TurbineParameters,
    label: string,
    min: number,
    max: number,
    step: number,
    unit: string
  ) => (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <Label className="text-sm font-medium">{label}</Label>
        <span className="text-sm text-muted-foreground">
          {parameters[key]} {unit}
        </span>
      </div>
      <Slider
        value={[parameters[key] as number]}
        onValueChange={(value) => onParameterChange(key, value[0])}
        max={max}
        min={min}
        step={step}
        className="w-full"
      />
    </div>
  );

  const renderSelectControl = (
    key: keyof TurbineParameters,
    label: string,
    options: { value: string; label: string }[]
  ) => (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      <Select
        value={parameters[key] as string}
        onValueChange={(value) => onParameterChange(key, value)}
      >
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Electrical Parameters */}
      <Card className="bg-gradient-primary border-0 text-primary-foreground">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
            Electrical Parameters
          </CardTitle>
          <CardDescription className="text-primary-foreground/80">
            Generator and electrical system metrics
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {renderSliderControl('generatorPower', 'Generator Power', 0, 5000, 10, 'kW')}
          {renderSliderControl('voltage', 'Voltage', 0, 1000, 1, 'V')}
          {renderSliderControl('current', 'Current', 0, 500, 1, 'A')}
          {renderSliderControl('frequency', 'Frequency', 45, 65, 0.1, 'Hz')}
          {renderSliderControl('powerFactor', 'Power Factor', 0, 1, 0.01, '')}
        </CardContent>
      </Card>

      {/* Wind & Environmental Parameters */}
      <Card className="bg-gradient-secondary border-0 text-secondary-foreground">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            Wind & Environmental
          </CardTitle>
          <CardDescription className="text-secondary-foreground/80">
            Weather and environmental conditions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {renderSliderControl('windSpeed', 'Wind Speed', 0, 30, 0.1, 'm/s')}
          {renderSliderControl('windDirection', 'Wind Direction', 0, 360, 1, '°')}
          {renderSliderControl('turbulenceIntensity', 'Turbulence Intensity', 0, 50, 1, '%')}
          {renderSliderControl('airDensity', 'Air Density', 1.0, 1.4, 0.01, 'kg/m³')}
          {renderSliderControl('temperature', 'Temperature', -30, 50, 1, '°C')}
          {renderSliderControl('pressure', 'Pressure', 950, 1050, 1, 'hPa')}
          {renderSliderControl('humidity', 'Humidity', 0, 100, 1, '%')}
        </CardContent>
      </Card>

      {/* Performance Parameters */}
      <Card className="bg-gradient-energy border-0 text-accent-foreground">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            Performance Parameters
          </CardTitle>
          <CardDescription className="text-accent-foreground/80">
            Turbine performance and efficiency metrics
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {renderSliderControl('tipSpeedRatio', 'Tip Speed Ratio', 0, 15, 0.1, '')}
          {renderSliderControl('coefficientPerformance', 'Coefficient of Performance', 0, 0.6, 0.01, '')}
          {renderSliderControl('powerCurve', 'Power Curve', 0, 100, 1, '%')}
          {renderSliderControl('capacityFactor', 'Capacity Factor', 0, 100, 1, '%')}
        </CardContent>
      </Card>

      {/* Control Parameters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
            Control Parameters
          </CardTitle>
          <CardDescription>
            Turbine control and operational settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {renderSliderControl('cutInWindSpeed', 'Cut-in Wind Speed', 0, 10, 0.1, 'm/s')}
          {renderSliderControl('ratedWindSpeed', 'Rated Wind Speed', 5, 25, 0.1, 'm/s')}
          {renderSliderControl('cutOutWindSpeed', 'Cut-out Wind Speed', 15, 35, 0.1, 'm/s')}
          {renderSelectControl('brakingSystemType', 'Braking System', [
            { value: 'aerodynamic', label: 'Aerodynamic' },
            { value: 'mechanical', label: 'Mechanical' },
            { value: 'hydraulic', label: 'Hydraulic' },
            { value: 'electromagnetic', label: 'Electromagnetic' }
          ])}
        </CardContent>
      </Card>

      {/* Health Monitoring Parameters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-400 rounded-full"></div>
            Health Monitoring
          </CardTitle>
          <CardDescription>
            System health and diagnostic parameters
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {renderSliderControl('vibrationLevels', 'Vibration Levels', 0, 100, 1, 'mm/s')}
          {renderSliderControl('componentTemperatures', 'Component Temperatures', 0, 150, 1, '°C')}
          {renderSliderControl('gearboxOilCondition', 'Gearbox Oil Condition', 0, 100, 1, '%')}
          {renderSliderControl('noiseLevels', 'Noise Levels', 0, 120, 1, 'dB')}
        </CardContent>
      </Card>

      {/* Structural Parameters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
            Structural Parameters
          </CardTitle>
          <CardDescription>
            Physical structure and materials
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {renderSelectControl('towerType', 'Tower Type', [
            { value: 'tubular', label: 'Tubular Steel' },
            { value: 'lattice', label: 'Lattice' },
            { value: 'concrete', label: 'Concrete' },
            { value: 'hybrid', label: 'Hybrid' }
          ])}
          {renderSliderControl('materialProperties', 'Material Properties', 0, 100, 1, '%')}
          {renderSelectControl('foundationType', 'Foundation Type', [
            { value: 'gravity', label: 'Gravity' },
            { value: 'pile', label: 'Pile' },
            { value: 'rock_anchor', label: 'Rock Anchor' },
            { value: 'mat', label: 'Mat Foundation' }
          ])}
        </CardContent>
      </Card>
    </div>
  );
}