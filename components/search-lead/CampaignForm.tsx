'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import { Search } from 'lucide-react';

interface CampaignFormProps {
  onSubmit: (data: { keyword: string; region: string; target: number }) => void;
  loading?: boolean;
}

export default function CampaignForm({ onSubmit, loading }: CampaignFormProps) {
  const [keyword, setKeyword] = useState('');
  const [region, setRegion] = useState('');
  const [target, setTarget] = useState(50);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (keyword && region && target > 0) {
      onSubmit({ keyword, region, target });
    }
  };

  return (
    <Card className="mb-6">
      <h2 className="text-lg font-semibold text-slate-900 mb-4">Buat Campaign Baru</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Kata Kunci / Jenis Bisnis"
            placeholder="Contoh: Hotel, Cafe, Restaurant"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            required
          />
          <Input
            label="Wilayah"
            placeholder="Contoh: Yogyakarta, Bali, Jakarta"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            required
          />
          <Input
            label="Target Lead Valid"
            type="number"
            min={1}
            max={500}
            value={target}
            onChange={(e) => setTarget(parseInt(e.target.value) || 50)}
            required
          />
        </div>
        <div className="flex justify-end">
          <Button type="submit" loading={loading} className="gap-2">
            <Search className="w-4 h-4" />
            Start Campaign
          </Button>
        </div>
      </form>
    </Card>
  );
}
