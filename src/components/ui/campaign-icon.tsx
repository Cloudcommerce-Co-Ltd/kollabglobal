import Image from 'next/image';

interface CampaignIconProps {
  product?: { productName: string; imageUrl?: string | null } | null;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'size-11 rounded-[10px] text-lg',
  md: 'size-14 rounded-[14px] text-2xl',
  lg: 'size-[72px] rounded-2xl text-[42px]',
};

export function CampaignIcon({ product, size = 'sm' }: CampaignIconProps) {
  const letter = product?.productName?.[0]?.toUpperCase() ?? '?';
  const cls = sizeClasses[size];

  if (product?.imageUrl) {
    return (
      <div className={`relative shrink-0 overflow-hidden ${cls}`}>
        <Image src={product.imageUrl} alt={product.productName} fill className="object-cover" />
      </div>
    );
  }

  return (
    <div className={`flex shrink-0 items-center justify-center bg-brand-light font-bold text-brand ${cls}`}>
      {letter}
    </div>
  );
}
