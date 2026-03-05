import { getStatusClass } from '@utils/helpers';

const StatusBadge = ({ status }) => {
    return (
        <span
            className={getStatusClass(status)}
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '0.25rem 0.75rem',
                borderRadius: '999px',
                fontSize: '0.7rem',
                fontWeight: 600,
                letterSpacing: '0.03em',
            }}
        >
            {status}
        </span>
    );
};

export default StatusBadge;
