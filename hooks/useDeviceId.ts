'use client';

import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

const DEVICE_ID_KEY = 'ai-chat-device-id';

export function useDeviceId() {
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // localStorage からデバイスIDを取得、なければ新規作成
    let id = localStorage.getItem(DEVICE_ID_KEY);

    if (!id) {
      id = uuidv4();
      localStorage.setItem(DEVICE_ID_KEY, id);
    }

    setDeviceId(id);
    setIsLoading(false);
  }, []);

  return { deviceId, isLoading };
}
