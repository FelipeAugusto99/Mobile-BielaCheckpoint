import { Notice } from './Notice';

export function OfflineBanner() {
  return (
    <Notice tone="warn">
      Você está sem conexão. Mostramos o que ficou salvo neste aparelho, e pode estar
      desatualizado.
    </Notice>
  );
}
