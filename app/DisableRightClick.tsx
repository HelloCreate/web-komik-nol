'use client';

import { useEffect } from 'react';

export default function DisableRightClick() {
  useEffect(() => {
    // Mematikan Klik Kanan Bawaan Browser
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    // Mematikan Shortcut Simpan (Ctrl+S / Cmd+S) dan View Source (Ctrl+U / Cmd+U)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey || e.metaKey) &&
        (e.key === 's' || e.key === 'u' || e.key === 'S' || e.key === 'U')
      ) {
        e.preventDefault();
      }
    };

    // Mematikan Drag Gambar Global
    const handleDragStart = (e: DragEvent) => {
      e.preventDefault();
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('dragstart', handleDragStart);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('dragstart', handleDragStart);
    };
  }, []);

  return null;
}