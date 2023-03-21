import { useSpring, animated } from 'react-spring';

// Store
import { useTaskStore, getPercentageCompletedTasks } from '../../../store/task.store';

// Styles
import styles from './ProgressBar.module.scss';

type Props = React.HTMLAttributes<HTMLDivElement>;

const ProgressBar: React.FC<Props> = ({ ...otherProps }: Props) => {
  
  const progress = useTaskStore(getPercentageCompletedTasks);

  const number = useSpring({
    from: { number: 0 },
    number: progress,
    delay: 50
  });

  return (
    <div
      {...otherProps}
      className={`progressBar ${styles.progressBar}`}
      role="progressbar"
      aria-valuenow={progress}
      aria-valuemin={0}
      aria-valuemax={100}>
      <div className={styles.progressBar__progress} style={{ width: `${progress}%` }}>
        <animated.span
          className={`${progress < 5 ? 'themeText' : ''} ${styles.progressBar__text}`} style={{ marginRight: progress < 5 ? '-2.5rem' : '0'}}
        >
          {number.number.to((n: number) => `${n.toFixed(0)} %`)}
        </animated.span>
      </div>
    </div>
  );
};

export default ProgressBar;