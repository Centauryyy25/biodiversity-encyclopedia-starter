flowchart TD
    A[Landing Page] --> B[Main Menu]
    B --> C[Browse Species]
    B --> D[Search and Filter]
    B --> E[AI Recognition Tool]
    B --> F[Interactive Map]
    B --> G[Contributor Portal]

    D --> H[Search Results]
    H --> I[Species Detail Page]

    C --> I[Species Detail Page]

    E --> J[Upload Photo]
    J --> K{Recognition Success?}
    K -->|Yes| L[Display Matches]
    K -->|No| M[Show Error]
    L --> I

    F --> N[Map with Species Layers]

    G --> O{Authenticated?}
    O -->|Yes| P[Contributor Dashboard]
    O -->|No| B[Main Menu]

    P --> Q[Submit New Species]
    Q --> R[Moderator Review]
    R --> S{Approved?}
    S -->|Yes| T[Publish Entry]
    S -->|No| U[Feedback to Contributor]
    T --> H[Search Results]