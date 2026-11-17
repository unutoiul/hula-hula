import type { ReactNode } from 'react';
import { badgeFrames, type BadgeFrameName } from './badgeFrames';
import './postcard-reel.css';
import './badge-reel.css';

/** A fixed decorative frame; its picture/content is rendered behind the alpha mask. */
export function BadgePicture({ frameName, children, label, eager = false }: {
  frameName: BadgeFrameName; children: ReactNode; label?: string; eager?: boolean;
}) {
  const frame = badgeFrames[frameName];
  return <div className="postcard-badge-stage" data-badge-frame={frameName} style={{ aspectRatio: `${frame.width} / ${frame.height}` }}>
    <div className="badge-picture-mask" style={{ maskImage: `url("${frame.mask}")`, WebkitMaskImage: `url("${frame.mask}")` }}>
      <div className="postcard-picture-window" role={label ? 'img' : undefined} aria-label={label}
        style={{ left: `${frame.window.left}%`, top: `${frame.window.top}%`, width: `${frame.window.width}%`, height: `${frame.window.height}%` }}>
        {children}
      </div>
    </div>
    <img className="badge-frame-layer" src={frame.image} alt="" aria-hidden="true" width={frame.width} height={frame.height}
      loading={eager ? 'eager' : 'lazy'} fetchPriority={eager ? 'high' : 'auto'} decoding="async" draggable={false} />
  </div>;
}
