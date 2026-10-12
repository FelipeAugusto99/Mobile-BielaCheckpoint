import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from './tokens';

/** Mensagem de confirmação temporária: `show("Guardado")` e some sozinha. */
export function useFlash() {
  const [message, setMessage] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback((text: string) => {
    if (timer.current) clearTimeout(timer.current);
    setMessage(text);
    timer.current = setTimeout(() => setMessage(null), motion.duration.flash);
  }, []);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  return { message, show };
}
