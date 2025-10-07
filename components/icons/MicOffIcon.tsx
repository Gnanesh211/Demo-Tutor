import React from 'react';

const MicOffIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <path d="M12 1.75a5.25 5.25 0 00-5.25 5.25v3.243l-1.42 1.42A.75.75 0 006 12.5v1.5a6.75 6.75 0 0010.054 5.578l-1.378-1.378A5.25 5.25 0 0112 18.75a5.25 5.25 0 01-5.25-5.25v-1.5a.75.75 0 00-1.5 0v1.5a6.75 6.75 0 006.75 6.75v2.54a.75.75 0 001.5 0v-2.54a6.75 6.75 0 006.529-6.27l-1.41-1.41V7a5.25 5.25 0 00-5.25-5.25z" />
    <path d="M8.25 7a3.75 3.75 0 013.75-3.75V3a5.25 5.25 0 00-3.75 1.571l1.411 1.411A3.733 3.733 0 018.25 7zM15.75 7a3.75 3.75 0 01-3.75 3.75v1.5a5.25 5.25 0 003.75-1.571l-1.41-1.411A3.735 3.735 0 0115.75 7z" />
    <path fillRule="evenodd" d="M3.52 3.11a.75.75 0 00-1.06 1.06l18 18a.75.75 0 101.06-1.06l-18-18z" clipRule="evenodd" />
  </svg>
);

export default MicOffIcon;