import 'package:flutter/material.dart';

/// Intuition Coaching Institute standardized spacing, padding, radii & shadow system.
class AppSpacing {
  AppSpacing._();

  // Spacing Scale
  static const double s4  = 4.0;
  static const double s8  = 8.0;
  static const double s12 = 12.0;
  static const double s16 = 16.0;
  static const double s20 = 20.0;
  static const double s24 = 24.0;
  static const double s32 = 32.0;
  static const double s40 = 40.0;
  static const double s48 = 48.0;

  // Edge Inset Shortcuts
  static const EdgeInsets p4  = EdgeInsets.all(s4);
  static const EdgeInsets p8  = EdgeInsets.all(s8);
  static const EdgeInsets p12 = EdgeInsets.all(s12);
  static const EdgeInsets p16 = EdgeInsets.all(s16);
  static const EdgeInsets p20 = EdgeInsets.all(s20);
  static const EdgeInsets p24 = EdgeInsets.all(s24);
  static const EdgeInsets p32 = EdgeInsets.all(s32);

  // Horizontal Padding Shortcuts
  static const EdgeInsets px12 = EdgeInsets.symmetric(horizontal: s12);
  static const EdgeInsets px16 = EdgeInsets.symmetric(horizontal: s16);
  static const EdgeInsets px20 = EdgeInsets.symmetric(horizontal: s20);
  static const EdgeInsets px24 = EdgeInsets.symmetric(horizontal: s24);

  // Vertical Padding Shortcuts
  static const EdgeInsets py8  = EdgeInsets.symmetric(vertical: s8);
  static const EdgeInsets py12 = EdgeInsets.symmetric(vertical: s12);
  static const EdgeInsets py16 = EdgeInsets.symmetric(vertical: s16);

  // Border Radii
  static const double r8  = 8.0;   // Chips, small buttons, tags
  static const double r12 = 12.0;  // Input fields, small cards
  static const double r16 = 16.0;  // Standard content cards
  static const double r20 = 20.0;  // Highlight banners
  static const double r24 = 24.0;  // Modals, Bottom sheets, Hero cards
  static const double rFull = 999.0;// Circular pills & avatars

  static const BorderRadius radius8  = BorderRadius.all(Radius.circular(r8));
  static const BorderRadius radius12 = BorderRadius.all(Radius.circular(r12));
  static const BorderRadius radius16 = BorderRadius.all(Radius.circular(r16));
  static const BorderRadius radius20 = BorderRadius.all(Radius.circular(r20));
  static const BorderRadius radius24 = BorderRadius.all(Radius.circular(r24));
  static const BorderRadius radiusFull = BorderRadius.all(Radius.circular(rFull));

  // Subtle Ambient Shadows (Light Mode)
  static List<BoxShadow> get shadowSm => [
        BoxShadow(
          color: const Color(0xFF0F172A).withOpacity(0.04),
          blurRadius: 6,
          offset: const Offset(0, 2),
        ),
      ];

  static List<BoxShadow> get shadowMd => [
        BoxShadow(
          color: const Color(0xFF0F172A).withOpacity(0.08),
          blurRadius: 16,
          offset: const Offset(0, 4),
        ),
      ];

  static List<BoxShadow> get shadowLg => [
        BoxShadow(
          color: const Color(0xFF0F172A).withOpacity(0.12),
          blurRadius: 28,
          offset: const Offset(0, 8),
        ),
      ];

  // Subtle Dark Mode Glow
  static List<BoxShadow> darkGlow(Color color) => [
        BoxShadow(
          color: color.withOpacity(0.2),
          blurRadius: 20,
          spreadRadius: 1,
        ),
      ];
}
