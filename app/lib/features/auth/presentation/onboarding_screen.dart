import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../../../core/router/route_paths.dart';
import '../../../core/storage/preferences_service.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/widgets/app_button.dart';

class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({super.key});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  final PageController _pageController = PageController();
  int _currentIndex = 0;

  final List<_OnboardingItem> _slides = const [
    _OnboardingItem(
      icon: LucideIcons.video,
      accentColor: AppColors.accentRose,
      title: 'Interactive Live Classrooms',
      subtitle:
          'Join crystal-clear lectures conducted by renowned author faculty. Engage via hand raises, live questions, and synced revision recordings.',
    ),
    _OnboardingItem(
      icon: LucideIcons.award,
      accentColor: AppColors.accentAmber,
      title: 'Synced All India Test Series',
      subtitle:
          'Attempt simulated NTA-pattern examinations with real-time countdowns, question palettes, instant percentiles, and AIR performance ranks.',
    ),
    _OnboardingItem(
      icon: LucideIcons.bookOpen,
      accentColor: AppColors.accentCyan,
      title: 'Study Materials & DPP Drills',
      subtitle:
          'Access theory lecture notes, daily practice problem archives, and syllabus trackers designed for JEE, NEET, and Olympiads.',
    ),
  ];

  void _onNext() async {
    if (_currentIndex < _slides.length - 1) {
      _pageController.nextPage(
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeInOut,
      );
    } else {
      await PreferencesService.setOnboarded(true);
      if (mounted) {
        context.go(RoutePaths.login);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.primary950,
      body: SafeArea(
        child: Column(
          children: [
            // Top Skip Button
            Align(
              alignment: Alignment.topRight,
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                child: TextButton(
                  onPressed: () async {
                    await PreferencesService.setOnboarded(true);
                    if (context.mounted) context.go(RoutePaths.login);
                  },
                  child: Text(
                    'Skip',
                    style: AppTypography.labelLarge(color: AppColors.primary400),
                  ),
                ),
              ),
            ),

            // Page View Content
            Expanded(
              child: PageView.builder(
                controller: _pageController,
                itemCount: _slides.length,
                onPageChanged: (index) {
                  setState(() => _currentIndex = index);
                },
                itemBuilder: (context, index) {
                  final slide = _slides[index];
                  return Padding(
                    padding: AppSpacing.px24,
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Container(
                          width: 110,
                          height: 110,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: slide.accentColor.withOpacity(0.12),
                            border: Border.all(
                              color: slide.accentColor.withOpacity(0.3),
                              width: 1.5,
                            ),
                          ),
                          child: Icon(
                            slide.icon,
                            size: 48,
                            color: slide.accentColor,
                          ),
                        ),
                        const SizedBox(height: 36),
                        Text(
                          slide.title,
                          style: AppTypography.headlineLarge(color: Colors.white),
                          textAlign: TextAlign.center,
                        ),
                        const SizedBox(height: 14),
                        Text(
                          slide.subtitle,
                          style: AppTypography.bodyMedium(
                            color: AppColors.darkTextSecondary,
                          ),
                          textAlign: TextAlign.center,
                        ),
                      ],
                    ),
                  );
                },
              ),
            ),

            // Bottom Navigation & Indicators
            Padding(
              padding: const EdgeInsets.fromLTRB(24, 16, 24, 24),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: List.generate(
                      _slides.length,
                      (index) => Container(
                        margin: const EdgeInsets.symmetric(horizontal: 4),
                        width: _currentIndex == index ? 24 : 8,
                        height: 8,
                        decoration: BoxDecoration(
                          color: _currentIndex == index
                              ? AppColors.primary500
                              : AppColors.darkBorder,
                          borderRadius: AppSpacing.radiusFull,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 28),
                  AppButton(
                    label: _currentIndex == _slides.length - 1 ? 'Get Started' : 'Continue',
                    onPressed: _onNext,
                    isFullWidth: true,
                    size: AppButtonSize.large,
                    variant: AppButtonVariant.primary,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _OnboardingItem {
  final IconData icon;
  final Color accentColor;
  final String title;
  final String subtitle;

  const _OnboardingItem({
    required this.icon,
    required this.accentColor,
    required this.title,
    required this.subtitle,
  });
}
