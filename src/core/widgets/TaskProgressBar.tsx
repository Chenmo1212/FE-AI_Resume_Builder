import React, { useEffect, useRef, useState } from 'react';
import { Progress, Typography } from 'antd';
import { getTaskProgressUrl } from '../../axios/api';

const { Text } = Typography;

interface ProgressEvent {
  step: string;
  pct: number;
  status: 'running' | 'done' | 'error';
}

interface TaskProgressBarProps {
  taskId: string;
  title: string;
  onDone?: () => void;
}

const STEP_LABELS: Record<string, string> = {
  parsing_job: 'Parsing job description',
  reading_resume: 'Reading resume',
  parallel_steps: 'Rewriting experience / projects / skills',
  summary: 'Writing summary',
  improving: 'Improving resume',
  finalizing: 'Saving results',
  done: 'Done',
  error: 'Failed',
};

export const TaskProgressBar: React.FC<TaskProgressBarProps> = ({ taskId, title, onDone }) => {
  const [pct, setPct] = useState<number>(0);
  const [step, setStep] = useState<string>('Waiting...');
  const [statusType, setStatusType] = useState<'normal' | 'success' | 'exception'>('normal');
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    const url = getTaskProgressUrl(taskId);
    const es = new EventSource(url);
    esRef.current = es;

    es.onmessage = (e: MessageEvent) => {
      try {
        const data: ProgressEvent = JSON.parse(e.data);
        setPct(data.pct);
        setStep(STEP_LABELS[data.step] ?? data.step);

        if (data.status === 'done') {
          setStatusType('success');
          es.close();
          onDone?.();
        } else if (data.status === 'error') {
          setStatusType('exception');
          es.close();
          onDone?.();
        }
      } catch {
        // Ignore malformed events (e.g. keep-alive comments)
      }
    };

    es.onerror = () => {
      setStatusType('exception');
      setStep('Connection error');
      es.close();
      onDone?.();
    };

    return () => {
      es.close();
    };
  }, [taskId]);

  return (
    <div style={{ marginBottom: 8 }}>
      <Text style={{ color: '#fff', fontSize: 12 }}>{title}</Text>
      <Progress
        percent={pct}
        status={statusType}
        size="small"
        format={() => step}
        style={{ marginTop: 2 }}
      />
    </div>
  );
};
