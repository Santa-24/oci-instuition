import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../../../core/theme/app_colors.dart';
import '../dashboard/student_dashboard_screen.dart';
import '../classes/student_classes_screen.dart';
import '../learn/student_learn_screen.dart';
import '../tests/student_tests_screen.dart';
import '../profile/student_profile_screen.dart';

class StudentShellScreen extends StatefulWidget {
  final int initialTab;

  const StudentShellScreen({super.key, this.initialTab = 0});

  @override
  State<StudentShellScreen> createState() => _StudentShellScreenState();
}

class _StudentShellScreenState extends State<StudentShellScreen> {
  late int _currentIndex;

  @override
  void initState() {
    super.initState();
    _currentIndex = widget.initialTab;
  }

  final List<Widget> _tabs = const [
    StudentDashboardScreen(),
    StudentClassesScreen(),
    StudentLearnScreen(),
    StudentTestsScreen(),
    StudentProfileScreen(),
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
              icon: Icon(LucideIcons.home, size: 20),
              activeIcon: Icon(LucideIcons.home, size: 20),
              label: 'Home',
            ),
            BottomNavigationBarItem(
              icon: Icon(LucideIcons.video, size: 20),
              activeIcon: Icon(LucideIcons.video, size: 20),
              label: 'Classes',
            ),
            BottomNavigationBarItem(
              icon: Icon(LucideIcons.bookOpen, size: 20),
              activeIcon: Icon(LucideIcons.bookOpen, size: 20),
              label: 'Learn',
            ),
            BottomNavigationBarItem(
              icon: Icon(LucideIcons.award, size: 20),
              activeIcon: Icon(LucideIcons.award, size: 20),
              label: 'Tests',
            ),
            BottomNavigationBarItem(
              icon: Icon(LucideIcons.user, size: 20),
              activeIcon: Icon(LucideIcons.user, size: 20),
              label: 'Profile',
            ),
          ],
        ),
      ),
    );
  }
}
