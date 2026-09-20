import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../../../core/theme/app_colors.dart';
import '../dashboard/faculty_dashboard_screen.dart';
import '../classes/faculty_classes_screen.dart';
import '../content/faculty_content_screen.dart';
import '../tests/faculty_tests_screen.dart';
import '../profile/faculty_profile_screen.dart';

class FacultyShellScreen extends StatefulWidget {
  final int initialTab;

  const FacultyShellScreen({super.key, this.initialTab = 0});

  @override
  State<FacultyShellScreen> createState() => _FacultyShellScreenState();
}

class _FacultyShellScreenState extends State<FacultyShellScreen> {
  late int _currentIndex;

  @override
  void initState() {
    super.initState();
    _currentIndex = widget.initialTab;
  }

  final List<Widget> _tabs = const [
    FacultyDashboardScreen(),
    FacultyClassesScreen(),
    FacultyContentScreen(),
    FacultyTestsScreen(),
    FacultyProfileScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: _tabs,
      ),
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: isDark ? AppColors.darkSurface : AppColors.lightSurface,
          border: Border(
            top: BorderSide(
              color: isDark ? AppColors.darkBorder : AppColors.lightBorder,
              width: 1,
            ),
          ),
        ),
        child: BottomNavigationBar(
          currentIndex: _currentIndex,
          onTap: (index) => setState(() => _currentIndex = index),
          items: const [
            BottomNavigationBarItem(
              icon: Icon(LucideIcons.layoutDashboard, size: 20),
              activeIcon: Icon(LucideIcons.layoutDashboard, size: 20),
              label: 'Overview',
            ),
            BottomNavigationBarItem(
              icon: Icon(LucideIcons.video, size: 20),
              activeIcon: Icon(LucideIcons.video, size: 20),
              label: 'Classes',
            ),
            BottomNavigationBarItem(
              icon: Icon(LucideIcons.uploadCloud, size: 20),
              activeIcon: Icon(LucideIcons.uploadCloud, size: 20),
              label: 'Content',
            ),
            BottomNavigationBarItem(
              icon: Icon(LucideIcons.checkSquare, size: 20),
              activeIcon: Icon(LucideIcons.checkSquare, size: 20),
              label: 'Grading',
            ),
            BottomNavigationBarItem(
              icon: Icon(LucideIcons.userCheck, size: 20),
              activeIcon: Icon(LucideIcons.userCheck, size: 20),
              label: 'Faculty',
            ),
          ],
        ),
      ),
    );
  }
}
