import BerryCard from '../BerryCard';
import { Grape, Apple, Cherry } from 'lucide-react';
import { useState } from 'react';

export default function BerryCardExample() {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="p-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <BerryCard 
          name="Espinaca Baby" 
          icon={Grape}
          color="hsl(142, 71%, 45%)"
          selected={selected === 'espinaca'}
          onClick={() => setSelected('espinaca')}
        />
        <BerryCard 
          name="Arándano" 
          icon={Apple}
          color="hsl(217, 91%, 60%)"
          selected={selected === 'arandano'}
          onClick={() => setSelected('arandano')}
        />
        <BerryCard 
          name="Frambuesa" 
          icon={Cherry}
          color="hsl(340, 82%, 52%)"
          selected={selected === 'frambuesa'}
          onClick={() => setSelected('frambuesa')}
        />
      </div>
    </div>
  );
}
