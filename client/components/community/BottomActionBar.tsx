import { Link } from 'react-router-dom';
import { Plus, LayoutGrid, List } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';

interface Props {
  active?: 'post' | 'all' | 'mine';
}

export default function BottomActionBar({ active }: Props) {
  const isActive = (key: Props['active']) => active === key;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, x: 16 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      transition={{ type: 'spring', stiffness: 320, damping: 24 }}
      className="fixed z-50"
      style={{
        right: '1.25rem',
        bottom: `calc(1.25rem + env(safe-area-inset-bottom, 0px))`,
      }}
    >
      <div className="relative pointer-events-auto select-none">
        {/* Bar */}
        <div className="relative bg-neutral-900/95 text-white/85 rounded-3xl shadow-2xl backdrop-blur px-5 sm:px-6 py-2.5 flex items-center gap-3 sm:gap-4">
          {(() => {
            type PillProps = {
              to: string;
              label: string;
              Icon: React.ComponentType<{ className?: string }>;
              active?: boolean;
              variant?: 'primary' | 'default';
              expanded?: number;
              ariaLabel?: string;
            };
            const ActionPill = ({ to, label, Icon, active, variant = 'default', expanded = 160, ariaLabel }: PillProps) => {
              const [hovered, setHovered] = useState(false);
              const isPrimary = variant === 'primary';
              const labelMax = Math.max(0, expanded - 60);
              return (
                <Link to={to} aria-label={ariaLabel || label} onFocus={() => setHovered(true)} onBlur={() => setHovered(false)}>
                  <motion.div
                    onMouseEnter={() => setHovered(true)}
                    onMouseLeave={() => setHovered(false)}
                    whileTap={{ scale: 0.98 }}
                    initial={false}
                    animate={{ width: hovered ? expanded : 48 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    className={[
                      'h-12 rounded-full overflow-hidden flex items-center',
                      'shadow-xl', hovered ? 'justify-start' : 'justify-center',
                      isPrimary
                        ? 'border-4 border-neutral-900/95 bg-gov-gold text-gov-navy'
                        : `text-white ring-1 ring-transparent ${active ? 'bg-white/10 ring-white/20' : 'hover:bg-white/10 hover:ring-white/20'}`,
                    ].join(' ')}
                    style={{ willChange: 'width', paddingLeft: hovered ? 12 : 0, paddingRight: hovered ? 12 : 0 }}
                  >
                    <Icon className={(isPrimary ? 'text-gov-navy ' : '') + 'w-5 h-5 shrink-0'} />
                    <motion.span
                      initial={false}
                      animate={{ opacity: hovered ? 1 : 0, x: hovered ? 0 : -8 }}
                      transition={{ duration: 0.18 }}
                      style={{ maxWidth: hovered ? labelMax : 0 }}
                      className={[
                        hovered ? 'ml-2' : 'ml-0',
                        'overflow-hidden whitespace-nowrap text-sm font-semibold',
                        isPrimary ? 'text-gov-navy' : 'text-white',
                      ].join(' ')}
                    >
                      {label}
                    </motion.span>
                  </motion.div>
                </Link>
              );
            };
            return (
              <>
                <ActionPill to="/new-post" label="Add new post" Icon={Plus} active={isActive('post')} variant="primary" expanded={168} ariaLabel="Create post" />
                <ActionPill to="/community" label="All posts" Icon={List} active={isActive('all')} />
                <ActionPill to="/my-posts" label="My posts" Icon={LayoutGrid} active={isActive('mine')} />
              </>
            );
          })()}
        </div>
      </div>
    </motion.div>
  );
}
