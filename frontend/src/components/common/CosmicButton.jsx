import React from 'react';
import styled from 'styled-components';

const CosmicButton = ({ children, onClick, variant, textColor, ...props }) => {
  return (
    <div>
      <StyledButton variant={variant} textColor={textColor} onClick={onClick} {...props}>
          <svg className="button-cosm" xmlnsXlink="http://www.w3.org/1999/xlink" fill="#000000" width={128} height={128} viewBox="0 0 256 256" id="Flat" xmlns="http://www.w3.org/2000/svg">
            <path d="M243.07324,157.43945c-1.2334-1.47949-23.18847-27.34619-60.46972-41.05859-1.67579-17.97412-8.25293-34.36328-18.93653-46.87158C149.41309,52.8208,128.78027,44,104,44,54.51074,44,22.10059,88.57715,20.74512,90.4751a3.99987,3.99987,0,0,0,6.50781,4.65234C27.5625,94.6958,58.68359,52,104,52c22.36816,0,40.89648,7.85107,53.584,22.70508,8.915,10.437,14.65625,23.9541,16.65528,38.894A133.54185,133.54185,0,0,0,136,108c-25.10742,0-46.09473,6.48486-60.69434,18.75391-12.65234,10.63379-19.91015,25.39355-19.91015,40.49463a43.61545,43.61545,0,0,0,12.69336,31.21923C76.98438,207.3208,89.40234,212,104,212c23.98047,0,44.37305-9.4668,58.97461-27.37744,12.74512-15.6333,20.05566-37.145,20.05566-59.01953,0-.1128-.001-.22559-.001-.33838,33.62988,13.48486,53.62207,36.96631,53.89746,37.2959a4.00015,4.00015,0,0,0,6.14648-5.1211ZM104,204c-27.89746,0-40.60449-19.05078-40.60449-36.75146C63.39551,142.56592,86.11621,116,136,116a124.37834,124.37834,0,0,1,38.97266,6.32617q.05712,1.63038.05761,3.27686C175.03027,177.07129,139.29785,204,104,204Z" />
          </svg>
          <svg className="highlight" viewBox="0 0 144.75738 77.18431" preserveAspectRatio="none">
            <g transform="translate(-171.52826,-126.11624)">
              <g fill="none" strokeWidth={17} strokeLinecap="round" strokeMiterlimit={10}>
                <path d="M180.02826,169.45123c0,0 12.65228,-25.55115 24.2441,-25.66863c6.39271,-0.06479 -5.89143,46.12943 4.90937,50.63857c10.22345,4.2681 24.14292,-52.38336 37.86455,-59.80493c3.31715,-1.79413 -5.35094,45.88889 -0.78872,58.34589c5.19371,14.18125 33.36934,-58.38221 36.43049,-56.91633c4.67078,2.23667 -0.06338,44.42744 5.22574,47.53647c6.04041,3.55065 19.87185,-20.77286 19.87185,-20.77286" />
              </g>
            </g>
          </svg>
          {children}
        </StyledButton>
        <svg height={0} width={0}>
          <filter id="handDrawnNoise">
            <feTurbulence result="noise" numOctaves={8} baseFrequency="0.1" type="fractalNoise" />
            <feDisplacementMap yChannelSelector="G" xChannelSelector="R" scale={3} in2="noise" in="SourceGraphic" />
          </filter>
          <filter id="handDrawnNoise2">
            <feTurbulence result="noise" numOctaves={8} baseFrequency="0.1" seed={1010} type="fractalNoise" />
            <feDisplacementMap yChannelSelector="G" xChannelSelector="R" scale={3} in2="noise" in="SourceGraphic" />
          </filter>
          <filter id="handDrawnNoiset">
            <feTurbulence result="noise" numOctaves={8} baseFrequency="0.1" type="fractalNoise" />
            <feDisplacementMap yChannelSelector="G" xChannelSelector="R" scale={6} in2="noise" in="SourceGraphic" />
          </filter>
          <filter id="handDrawnNoiset2">
            <feTurbulence result="noise" numOctaves={8} baseFrequency="0.1" seed={1010} type="fractalNoise" />
            <feDisplacementMap yChannelSelector="G" xChannelSelector="R" scale={6} in2="noise" in="SourceGraphic" />
          </filter>
        </svg>
      </div>
  );
}

const StyledButton = styled.button`
  text-align: center;
  transition: 0.3s ease-in-out;
  cursor: pointer;
  background-color: transparent;
  filter: url(#handDrawnNoise);
  display: inline-flex;
  align-items: center;
  user-select: none;
  font-family: "Courier New", monospace;
  font-weight: bold;
  border-width: 0px;
  border-radius: 2rem;
  box-shadow: #33333366 4px 4px 0 1px;
  animation: idle 1s infinite ease-in-out;
  position: relative;

  /* Default styles */
  font-size: 1.5rem;
  padding: 1em;
  color: ${({ textColor }) => textColor || '#000000'};

  /* Variant styles */
  ${({ variant, textColor }) => variant === 'small' && `
    font-size: 1rem;
    padding: 0.5em 1em;
    color: ${textColor || '#000000'} !important;

    @media (max-width: 768px) {
      font-size: 0.875rem;
      padding: 0.4em 0.8em;
    }

    @media (max-width: 480px) {
      font-size: 0.75rem;
      padding: 0.3em 0.6em;
    }
  `}

  .button-cosm {
    fill: #33333366;
    transition: 0.3s ease-out;
    scale: 0.5;
    position: absolute;
    translate: calc(-100% + 24px) 1.5rem;
  }

  .highlight {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    fill: rgba(255, 225, 0, 0.5);
    stroke: rgba(255, 225, 0, 0.5);
    stroke-width: 10;
    stroke-linecap: round;
    pointer-events: none;
    stroke-dasharray: 1000;
    stroke-dashoffset: 1000;
    transition: stroke-dashoffset 0.5s ease-in-out;
  }

  &:hover {
    font-weight: bold;
    border-width: 0px;
    border-radius: 2rem;
    rotate: -2.5deg;
    animation: hover 2.5s infinite ease-in-out;
  }

  &:hover .highlight {
    stroke-dashoffset: 0;
  }

  &:active .highlight {
    stroke-dashoffset: 1000;
    animation:
      highlight 5s infinite,
      col 0.5s forwards;
    stroke: #bc4e2666;
  }

  &:hover .button-cosm {
    rotate: -15deg;
    translate: calc(-100% + 22px) 1.9rem;
  }

  &:active .button-cosm {
    fill: #333333f1;
    rotate: -135deg;
    translate: calc(-100% + 55px) 1.6rem;
    animation: none;
  }

  &:active {
    font-weight: bold;
    border-width: 0px;
    border-radius: 2rem;
    box-shadow: inset #333333f1 4px 4px 0 1px;
    rotate: -2.5deg;
    animation: active 1s infinite ease-in-out;
  }

  @keyframes idle {
    0% {
      filter: url(#handDrawnNoise);
    }
    50% {
      rotate: 2.5deg;
      filter: url(#handDrawnNoise2);
    }
    100% {
      filter: url(#handDrawnNoise);
    }
  }

  @keyframes col {
    0% {
      stroke: rgba(255, 225, 0, 0.5);
    }
    100% {
      stroke: #1c98eb66;
    }
  }

  @keyframes highlight {
    0% {
      stroke-dashoffset: 0;
    }
    25% {
      stroke-dashoffset: 1000;
    }
    50% {
      stroke-dashoffset: 1000;
    }
    100% {
      stroke-dashoffset: 0;
    }
  }

  @keyframes hover {
    0% {
      rotate: 0deg;
      filter: url(#handDrawnNoise);
      translate: 0 0px;
    }
    25% {
      rotate: -1deg;
      filter: url(#handDrawnNoise2);
      translate: 0 -2px;
    }
    50% {
      rotate: 0deg;
      filter: url(#handDrawnNoise);
      translate: 0 2px;
    }
    75% {
      rotate: -1deg;
      filter: url(#handDrawnNoise2);
      translate: 0 -2px;
    }
    100% {
      rotate: 0deg;
      filter: url(#handDrawnNoise);
      translate: 0 0px;
    }
  }

  @keyframes active {
    0% {
      filter: url(#handDrawnNoiset);
      translate: 0 -1px;
    }
    25% {
      rotate: -3deg;
    }
    50% {
      filter: url(#handDrawnNoiset2);
      translate: 0 1px;
    }
    66% {
      rotate: 1.5deg;
    }
    100% {
      filter: url(#handDrawnNoiset);
      translate: 0 -1px;
    }
  }`;

export default CosmicButton;