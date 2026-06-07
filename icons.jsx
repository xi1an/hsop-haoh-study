function HSOPIcon({ name }) {
  const paths = {
    home: (
      <React.Fragment>
        <path d="M3 10.5 12 3l9 7.5" />
        <path d="M5 9.5V21h14V9.5" />
        <path d="M9 21v-7h6v7" />
      </React.Fragment>
    ),
    plan: (
      <React.Fragment>
        <path d="M7 3v4M17 3v4" />
        <path d="M4 8h16" />
        <path d="M5 5h14a2 2 0 0 1 2 2v14H3V7a2 2 0 0 1 2-2z" />
        <path d="M8 13h3M8 17h7" />
      </React.Fragment>
    ),
    library: (
      <React.Fragment>
        <path d="M4 19.5V5a2 2 0 0 1 2-2h12v18H6a2 2 0 0 1 0-4h12" />
        <path d="M8 7h7M8 11h6" />
      </React.Fragment>
    ),
    review: (
      <React.Fragment>
        <path d="M20 7 10 17l-5-5" />
        <path d="M4 4h16v16H4z" />
      </React.Fragment>
    ),
    plus: <path d="M12 5v14M5 12h14" />,
    settings: (
      <React.Fragment>
        <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z" />
        <path d="M19.4 15a1.8 1.8 0 0 0 .36 1.98l.03.03a2.1 2.1 0 0 1-2.98 2.98l-.03-.03A1.8 1.8 0 0 0 15 19.4a1.8 1.8 0 0 0-1 .58 1.8 1.8 0 0 0-.4 1.02V21a2.1 2.1 0 0 1-4.2 0v-.04A1.8 1.8 0 0 0 8 19.4a1.8 1.8 0 0 0-1.98.36l-.03.03a2.1 2.1 0 0 1-2.98-2.98l.03-.03A1.8 1.8 0 0 0 3.6 15a1.8 1.8 0 0 0-.58-1A1.8 1.8 0 0 0 2 13.6H2a2.1 2.1 0 0 1 0-4.2h.04A1.8 1.8 0 0 0 3.6 8a1.8 1.8 0 0 0-.36-1.98l-.03-.03a2.1 2.1 0 1 1 2.98-2.98l.03.03A1.8 1.8 0 0 0 8 3.6a1.8 1.8 0 0 0 1-.58A1.8 1.8 0 0 0 9.4 2V2a2.1 2.1 0 0 1 4.2 0v.04A1.8 1.8 0 0 0 15 3.6a1.8 1.8 0 0 0 1.98-.36l.03-.03a2.1 2.1 0 1 1 2.98 2.98l-.03.03A1.8 1.8 0 0 0 19.4 8a1.8 1.8 0 0 0 .58 1 1.8 1.8 0 0 0 1.02.4H21a2.1 2.1 0 0 1 0 4.2h-.04A1.8 1.8 0 0 0 19.4 15z" />
      </React.Fragment>
    ),
    bank: (
      <React.Fragment>
        <path d="M3 21h18" />
        <path d="M5 21V9l7-4 7 4v12" />
        <path d="M9 21v-8h6v8" />
      </React.Fragment>
    ),
    english: (
      <React.Fragment>
        <path d="M4 19V5a2 2 0 0 1 2-2h8l6 6v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" />
        <path d="M14 3v6h6" />
        <path d="M8 16h8M8 12h4" />
      </React.Fragment>
    ),
    code: (
      <React.Fragment>
        <path d="m8 9-4 3 4 3" />
        <path d="m16 9 4 3-4 3" />
        <path d="m14 5-4 14" />
      </React.Fragment>
    ),
    bookmark: <path d="M6 4h12v17l-6-3-6 3z" />,
    apps: (
      <React.Fragment>
        <path d="M4 4h6v6H4z" />
        <path d="M14 4h6v6h-6z" />
        <path d="M4 14h6v6H4z" />
        <path d="M14 14h6v6h-6z" />
      </React.Fragment>
    ),
    spreadsheet: (
      <React.Fragment>
        <path d="M4 4h16v16H4z" />
        <path d="M4 9h16M4 14h16M9 4v16M15 4v16" />
      </React.Fragment>
    ),
    card: (
      <React.Fragment>
        <path d="M4 7.5A2.5 2.5 0 0 1 6.5 5h11A2.5 2.5 0 0 1 20 7.5v9A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5v-9Z" />
        <path d="M4 10h16" />
        <path d="M8 15h4" />
      </React.Fragment>
    ),
    briefcase: (
      <React.Fragment>
        <path d="M10 6V5a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v1" />
        <path d="M4 7h16v12H4z" />
        <path d="M4 12h16" />
      </React.Fragment>
    ),
    arrowLeft: <path d="M19 12H5M12 19l-7-7 7-7" />,
    search: (
      <React.Fragment>
        <path d="m21 21-4.3-4.3" />
        <circle cx="11" cy="11" r="7" />
      </React.Fragment>
    ),
    close: <path d="M18 6 6 18M6 6l12 12" />,
  };

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {paths[name]}
    </svg>
  );
}

Object.assign(window, { HSOPIcon });
