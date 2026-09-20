import 'package:flutter/material.dart';

/// OCI Unified Academic Design Palette.
/// Editorial, calm, high-trust, light-first color architecture.
class AppColors {
  AppColors._();

  // Primary Academic Brand Palette (Deep Navy / Royal Indigo)
  static const Color primaryNavy     = Color(0xFF0F172A); // Slate 900 - Anchor brand
  static const Color primary950      = Color(0xFF0F172A); // Deepest canvas
  static const Color primary900      = Color(0xFF1E1B4B); // Deep midnight indigo
  static const Color primary800      = Color(0xFF312E81); // Rich royal navy
  static const Color primary700      = Color(0xFF3730A3); // Container accent
  static const Color primary600      = Color(0xFF4338CA); // Core brand interactive CTA
  static const Color primary500      = Color(0xFF4F46E5); // Academic indigo
  static const Color primaryIndigo   = primary600;        // Standard brand indigo
  static const Color primary400      = Color(0xFF6366F1); // Highlight tint
  static const Color primary200      = Color(0xFFC7D2FE); // Subtle border tint
  static const Color primary100      = Color(0xFFE0E7FF); // Light wash
  static const Color primary50       = Color(0xFFEEF2FF); // Ultra-soft wash

  // Editorial Accents & Categories
  static const Color accentAmber     = Color(0xFFD97706); // Focus, test milestones, alerts
  static const Color accentRose      = Color(0xFFE11D48); // Urgent notices, live indicator
  static const Color accentEmerald   = Color(0xFF059669); // Accuracy, success, completions
  static const Color accentCyan      = Color(0xFF0284C7); // Study resources, curriculum
  static const Color accentPurple    = Color(0xFF7C3AED); // Special lectures, doubt desk
  static const Color liveRed         = Color(0xFFDC2626); // Pulsing Live beacon

  // Semantic States
  static const Color success         = Color(0xFF059669); // Active, passed, present
  static const Color warning         = Color(0xFFD97706); // Upcoming, review, late
  static const Color error           = Color(0xFFDC2626); // Absent, failed, interrupted
  static const Color info            = Color(0xFF2563EB); // Announcements, general info

  // Light Theme Surfaces (Primary Default Experience)
  static const Color lightBackground     = Color(0xFFF8FAFC); // Warm slate canvas
  static const Color lightSurface        = Color(0xFFFFFFFF); // Pure white card
  static const Color lightSurfaceElevated= Color(0xFFF1F5F9); // Interactive tile / pill hover
  static const Color lightBorder         = Color(0xFFE2E8F0); // Delicate structural hairline
  static const Color lightBorderSubtle   = Color(0xFFEEF2F6); // Ultra subtle separator
  static const Color lightTextPrimary    = Color(0xFF0F172A); // Slate 900 - High legibility
  static const Color lightTextSecondary  = Color(0xFF475569); // Slate 600 - Descriptive
  static const Color lightTextMuted      = Color(0xFF94A3B8); // Slate 400 - Secondary metadata

  // Dark Theme Surfaces (Optional System Dark Canvas)
  static const Color darkBackground      = Color(0xFF0B0F19); // Muted dark canvas
  static const Color darkSurface         = Color(0xFF131B2E); // Restrained card background
  static const Color darkSurfaceElevated = Color(0xFF1E293B); // Elevated modal / pill
  static const Color darkBorder          = Color(0xFF23304B); // Calm outline without harsh glow
  static const Color darkTextPrimary     = Color(0xFFF8FAFC); // High contrast soft white
  static const Color darkTextSecondary   = Color(0xFF94A3B8); // Slate 400
  static const Color darkTextMuted       = Color(0xFF64748B); // Slate 500
}
