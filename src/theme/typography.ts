export interface Md3TypeScale {
  size: string;
  lineHeight: string;
  weight: number;
  tracking?: string;
}

export const md3TypeScale: Record<string, Md3TypeScale> = {
  'display-large':  { size: '57px',  lineHeight: '64px',  weight: 400, tracking: '-0.25px' },
  'display-medium': { size: '45px',  lineHeight: '52px',  weight: 400, tracking: '0px' },
  'display-small':  { size: '36px',  lineHeight: '44px',  weight: 400, tracking: '0px' },
  'headline-large':  { size: '32px',  lineHeight: '40px',  weight: 400, tracking: '0px' },
  'headline-medium': { size: '28px',  lineHeight: '36px',  weight: 400, tracking: '0px' },
  'headline-small':  { size: '24px',  lineHeight: '32px',  weight: 400, tracking: '0px' },
  'title-large':    { size: '22px',  lineHeight: '28px',  weight: 400, tracking: '0px' },
  'title-medium':   { size: '16px',  lineHeight: '24px',  weight: 500, tracking: '0.15px' },
  'title-small':    { size: '14px',  lineHeight: '20px',  weight: 500, tracking: '0.1px' },
  'body-large':     { size: '16px',  lineHeight: '24px',  weight: 400, tracking: '0.5px' },
  'body-medium':    { size: '14px',  lineHeight: '20px',  weight: 400, tracking: '0.25px' },
  'body-small':     { size: '12px',  lineHeight: '16px',  weight: 400, tracking: '0.4px' },
  'label-large':    { size: '14px',  lineHeight: '20px',  weight: 500, tracking: '0.1px' },
  'label-medium':   { size: '12px',  lineHeight: '16px',  weight: 500, tracking: '0.5px' },
  'label-small':    { size: '11px',  lineHeight: '16px',  weight: 500, tracking: '0.5px' },
} as const;

export type Md3TypeScaleKey = keyof typeof md3TypeScale;

export const md3TypeScaleClass: Record<Md3TypeScaleKey, string> = {
  'display-large':  'text-[57px] leading-[64px] font-normal tracking-[-0.25px]',
  'display-medium': 'text-[45px] leading-[52px] font-normal',
  'display-small':  'text-[36px] leading-[44px] font-normal',
  'headline-large':  'text-[32px] leading-[40px] font-normal',
  'headline-medium': 'text-[28px] leading-[36px] font-normal',
  'headline-small':  'text-[24px] leading-[32px] font-normal',
  'title-large':    'text-[22px] leading-[28px] font-normal',
  'title-medium':   'text-[16px] leading-[24px] font-medium tracking-[0.15px]',
  'title-small':    'text-[14px] leading-[20px] font-medium tracking-[0.1px]',
  'body-large':     'text-[16px] leading-[24px] font-normal tracking-[0.5px]',
  'body-medium':    'text-[14px] leading-[20px] font-normal tracking-[0.25px]',
  'body-small':     'text-[12px] leading-[16px] font-normal tracking-[0.4px]',
  'label-large':    'text-[14px] leading-[20px] font-medium tracking-[0.1px]',
  'label-medium':   'text-[12px] leading-[16px] font-medium tracking-[0.5px]',
  'label-small':    'text-[11px] leading-[16px] font-medium tracking-[0.5px]',
} as const;
