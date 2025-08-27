# Product Requirements Document: Alka's CakeWalk Website

## 1. Introduction/Overview

This document outlines the requirements for a new website for "Alka's CakeWalk," a home-based bakery in India specializing in custom cakes. The project aims to create a modern, visually appealing, and professional online presence to showcase the baker's work and generate customer inquiries. The website will be a static Progressive Web App (PWA) built with ReactJS. The initial version (V1) will focus on lead generation via WhatsApp, with the potential for future e-commerce integration.

## 2. Goals

*   **Primary:** To create a professional and appealing online portfolio that drives customer inquiries to the baker's WhatsApp.
*   **Secondary:** To establish a strong brand identity with a clean, modern aesthetic inspired by Apple's design principles.
*   **Technical:** To build a scalable and maintainable static PWA using ReactJS that can be easily updated with new content (images, testimonials).
*   **Future-Proofing:** To create a structure that allows for easy integration with an Amazon S3 bucket for image hosting and potential future e-commerce features.

## 3. User Stories

*   **As a potential customer,** I want to see high-quality pictures of past cakes so I can judge the baker's skill and style.
*   **As a potential customer,** I want to easily find the menu to understand the available flavors and options.
*   **As a potential customer,** I want to find contact information (Phone, WhatsApp, Email, Instagram) easily so I can make an inquiry or place a custom order.
*   **As a potential customer,** I want to read testimonials from previous clients to build trust in the baker's quality and service.
*   **As the baker,** I want a beautiful website that I can share with potential clients to showcase my work professionally.
*   **As the baker,** I want the ability to easily update the cake pictures in the gallery as I create new ones.

## 4. Functional Requirements

### 4.1. General

1.  **Framework:** The website will be built using ReactJS.
2.  **PWA:** The application must be a Progressive Web App.
3.  **Image Handling:** For development, images will be stored in a local `/public/images/` directory. The implementation should make it straightforward to switch to an S3 bucket source in the future.
4.  **Social Media Links:** Links to Instagram, WhatsApp, and Email must be present and easily accessible on all pages (e.g., in the footer).
5.  **Call-to-Action (CTA):** An "Order Now" button should be prominently displayed, redirecting users to a WhatsApp chat with the baker (`+918668281565`).

### 4.2. Hero Page

1.  **Branding:** Must feature the "Alka's CakeWalk" brand name and logo (`assets/acw-logo.jpeg`).
2.  **Punchline:** A catchy and appealing punchline. Suggestions:
    *   "Baking memories, one cake at a time."
    *   "Where every slice is a piece of art."
    *   "Your vision, deliciously realized."
3.  **Visuals:** A high-quality, full-width image of a cake should serve as the background or primary visual element.
4.  **Carousel:** A sleek, modern carousel showcasing at least 10 fancy images of the latest cakes.
5.  **Testimonials:** A section displaying testimonials from past clients. This will use dummy data initially.

### 4.3. Product Menu Page

1.  **Menu Display:** The page will display the product menu from the image `assets/acw-menu.jpeg`.
2.  **Pricing:** Pricing information will be added at a later stage.

### 4.4. Gallery Page

1.  **Image Grid:** An aesthetically pleasing grid layout of all cake pictures.
2.  **Filtering:** Users must be able to filter the gallery using tags (e.g., #themecakes, #chocolate, #anniversary, #birthday).

### 4.5. Contact Us Page

1.  **Contact Details:** The page must list the following contact information:
    *   **Email:** `alkascakewalk@gmail.com`
    *   **Phone:** `+91 866 828 1565`
    *   **Instagram:** A link to the profile `alkas_cake_walk`
    *   **WhatsApp:** A link to start a chat with `+91 866 828 1565`
    *   **YouTube:** A placeholder for a future YouTube channel link.

## 5. Non-Goals (Out of Scope for V1)

*   Online payment gateway integration.
*   User account creation or login functionality.
*   A backend system for managing orders or content.
*   Direct image upload functionality for the baker through the website's frontend.
*   Database integration.

## 6. Design Considerations

*   **Aesthetic:** The design should be clean, modern, soothing, and refreshing, avoiding the cluttered look of typical bakery websites.
*   **Inspiration:** The UI/UX will be heavily inspired by **Apple's design principles**, emphasizing minimalism, generous whitespace, high-quality typography, and a strong focus on the visual content (the cakes).
*   **Color Palette & Fonts:** A palette and font selection will be proposed that aligns with the desired modern and soothing aesthetic.

## 7. Technical Considerations

*   **State Management:** For this simple static site, React's built-in state management (useState, useContext) should be sufficient.
*   **PWA Configuration:** A `manifest.json` and service worker will be configured to meet PWA requirements.
*   **Image Optimization:** Images should be optimized for the web to ensure fast load times.

## 8. Success Metrics

*   Successful deployment of the website to a hosting provider.
*   Positive feedback from the baker on the design and functionality.
*   An increase in customer inquiries received via WhatsApp, attributed to the website.

## 9. Open Questions

*   Which punchline should be used?
*   What are the specific filter tags to be used in the gallery besides the examples provided?

## 10. Database Structure

*   No database is required for V1 of this application.

## 11. Application Modules

Based on the requirements, the React application will be structured with the following components/modules:

*   `components/common/`: Reusable components like `Header`, `Footer`, `Button`, `SocialLinks`.
*   `components/home/`: Components specific to the Hero page, like `HeroSection`, `CakeCarousel`, `Testimonials`.
*   `components/gallery/`: Components for the gallery, like `GalleryGrid`, `FilterBar`.
*   `pages/`: React components for each page (`HomePage.js`, `MenuPage.js`, `GalleryPage.js`, `ContactPage.js`).
*   `assets/`: For static assets like the logo, menu image, and favicon.
*   `public/images/cakes/`: To store cake images for the gallery and carousel during development.
