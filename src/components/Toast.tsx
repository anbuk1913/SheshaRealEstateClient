import React from 'react';
import styled from 'styled-components';

interface ToastProps {
  message: string;
  subText?: string;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, subText, type = 'success', onClose }) => {
  React.useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const iconPaths = {
    success: "M369 209c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-111 111-47-47c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9l64 64c9.4 9.4 24.6 9.4 33.9 0L369 209z",
    error: "M256 48a208 208 0 1 1 0 416 208 208 0 1 1 0-416zm0 464A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM175 175c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9L222.1 256 141.1 337c-9.4 9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0L256 289.9l81 81c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9L289.9 256l81-81c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0L256 222.1 175 141.1z",
    info: "M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM232 344V280c0-13.3 10.7-24 24-24s24 10.7 24 24v64c0 13.3-10.7 24-24 24s-24-10.7-24-24zM256 80a32 32 0 1 1 0 64 32 32 0 1 1 0-64z",
  };

  const colorSchemes = {
    success: { bg: '#04e4003a', wave: '#04e4003a', icon: '#269b24', iconBg: '#04e40048', text: '#269b24' },
    error: { bg: '#ff33333a', wave: '#ff33333a', icon: '#dc2626', iconBg: '#ff33333a', text: '#dc2626' },
    info: { bg: '#3b82f63a', wave: '#3b82f63a', icon: '#2563eb', iconBg: '#3b82f63a', text: '#2563eb' },
  };

  const colors = colorSchemes[type];

  return (
    <StyledWrapper colors={colors}>
      <div className="card">
        <svg className="wave" viewBox="0 0 1440 320" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,256L11.4,240C22.9,224,46,192,69,192C91.4,192,114,224,137,234.7C160,245,183,235,206,213.3C228.6,192,251,160,274,149.3C297.1,139,320,149,343,181.3C365.7,213,389,267,411,282.7C434.3,299,457,277,480,250.7C502.9,224,526,192,549,181.3C571.4,171,594,181,617,208C640,235,663,277,686,256C708.6,235,731,149,754,122.7C777.1,96,800,128,823,165.3C845.7,203,869,245,891,224C914.3,203,937,117,960,112C982.9,107,1006,181,1029,197.3C1051.4,213,1074,171,1097,144C1120,117,1143,107,1166,133.3C1188.6,160,1211,224,1234,218.7C1257.1,213,1280,139,1303,133.3C1325.7,128,1349,192,1371,192C1394.3,192,1417,128,1429,96L1440,64L1440,320L1428.6,320C1417.1,320,1394,320,1371,320C1348.6,320,1326,320,1303,320C1280,320,1257,320,1234,320C1211.4,320,1189,320,1166,320C1142.9,320,1120,320,1097,320C1074.3,320,1051,320,1029,320C1005.7,320,983,320,960,320C937.1,320,914,320,891,320C868.6,320,846,320,823,320C800,320,777,320,754,320C731.4,320,709,320,686,320C662.9,320,640,320,617,320C594.3,320,571,320,549,320C525.7,320,503,320,480,320C457.1,320,434,320,411,320C388.6,320,366,320,343,320C320,320,297,320,274,320C251.4,320,229,320,206,320C182.9,320,160,320,137,320C114.3,320,91,320,69,320C45.7,320,23,320,11,320L0,320Z" fillOpacity={1} />
        </svg>
        <div className="icon-container">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" strokeWidth={0} fill="currentColor" stroke="currentColor" className="icon">
            <path d={iconPaths[type]} />
          </svg>
        </div>
        <div className="message-text-container">
          <p className="message-text">{message}</p>
          {subText && <p className="sub-text">{subText}</p>}
        </div>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 15 15" strokeWidth={0} fill="none" stroke="currentColor" className="cross-icon" onClick={onClose}>
          <path fill="currentColor" d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z" clipRule="evenodd" fillRule="evenodd" />
        </svg>
      </div>
    </StyledWrapper>
  );
};

interface StyledWrapperProps {
  colors: {
    bg: string;
    wave: string;
    icon: string;
    iconBg: string;
    text: string;
  };
}

const StyledWrapper = styled.div<StyledWrapperProps>`
  .card {
    width: 270px;         /* was 330px */
    height: 64px;         /* was 80px */
    border-radius: 8px;
    box-sizing: border-box;
    padding: 8px 12px;    /* was 10px 15px */
    background-color: #ffffff;
    box-shadow: rgba(149, 157, 165, 0.2) 0px 8px 24px;
    position: relative;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: space-around;
    gap: 10px;            /* was 15px */
    animation: slideIn 0.3s ease-out;
  }

  @keyframes slideIn {
    from {
      transform: translateY(-100%);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  .wave {
    position: absolute;
    transform: rotate(90deg);
    left: -26px;          /* was -31px */
    top: 25px;            /* was 32px */
    width: 65px;          /* was 80px */
    fill: ${props => props.colors.wave};
  }

  .icon-container {
    width: 28px;          /* was 35px */
    height: 28px;         /* was 35px */
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: ${props => props.colors.iconBg};
    border-radius: 50%;
    margin-left: 6px;     /* was 8px */
    flex-shrink: 0;
  }

  .icon {
    width: 13px;          /* was 17px */
    height: 13px;         /* was 17px */
    color: ${props => props.colors.icon};
  }

  .message-text-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    flex-grow: 1;
  }

  .message-text,
  .sub-text {
    margin: 0;
    cursor: default;
  }

  .message-text {
    color: ${props => props.colors.text};
    font-size: 14px;      /* was 17px */
    font-weight: 700;
  }

  .sub-text {
    font-size: 12px;      /* was 14px */
    color: #555;
  }

  .cross-icon {
    width: 14px;          /* was 18px */
    height: 14px;         /* was 18px */
    color: #555;
    cursor: pointer;
    flex-shrink: 0;
    transition: color 0.2s;

    &:hover {
      color: #333;
    }
  }
`;

export default Toast;