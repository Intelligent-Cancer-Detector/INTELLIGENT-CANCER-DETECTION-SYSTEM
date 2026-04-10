/* ====================================
   Responsive Design Enhancements
   ==================================== */

/* Extra large devices (1400px and up) */
@media (min-width: 1400px) {
    .container {
        max-width: 1320px;
    }
}

/* Large devices (1200px to 1399px) */
@media (max-width: 1399px) and (min-width: 1200px) {
    .container {
        max-width: 1140px;
    }
}

/* Medium devices (992px to 1199px) */
@media (max-width: 1199px) and (min-width: 992px) {
    .container {
        max-width: 960px;
    }
    
    h1 { font-size: 3rem; }
    h2 { font-size: 2.25rem; }
}

/* Small devices (768px to 991px) */
@media (max-width: 991px) and (min-width: 768px) {
    .container {
        max-width: 720px;
    }
    
    .features-grid {
        grid-template-columns: repeat(2, 1fr);
    }
}

/* Extra small devices (576px to 767px) */
@media (max-width: 767px) and (min-width: 576px) {
    .container {
        max-width: 540px;
    }
    
    .features-grid {
        grid-template-columns: 1fr;
    }
}

/* Very small devices (less than 576px) */
@media (max-width: 575px) {
    .container {
        padding: 0 20px;
    }
}

/* Landscape mode for mobile */
@media (max-height: 500px) and (orientation: landscape) {
    .hero {
        padding: 100px 0 50px;
    }
    
    .hero h1 {
        font-size: 2.5rem;
    }
}

/* High-resolution displays */
@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
    /* High-res specific styles */
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
    /* Optional dark mode styles */
}

/* Print styles */
@media print {
    @page {
        margin: 2cm;
    }
    
    body {
        font-size: 12pt;
        line-height: 1.5;
        color: #000;
        background: #fff;
    }
    
    a {
        text-decoration: underline;
        color: #000;
    }
    
    .no-print {
        display: none !important;
    }
}

/* Accessibility */
@media (prefers-reduced-motion: reduce) {
    * {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
        scroll-behavior: auto !important;
    }
}