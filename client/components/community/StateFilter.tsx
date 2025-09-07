import { INDIA_STATES, IndiaState } from '@/lib/communityStore';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Props {
  value: IndiaState;
  onChange: (state: IndiaState) => void;
}

export default function StateFilter({ value, onChange }: Props) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as IndiaState)}>
      <SelectTrigger className="w-full sm:w-72">
        <SelectValue placeholder="Select state" />
      </SelectTrigger>
      <SelectContent>
        {INDIA_STATES.map(s => (
          <SelectItem key={s} value={s}>{s}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
