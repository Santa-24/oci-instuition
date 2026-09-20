import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../../core/config/app_constants.dart';
import '../../../core/router/route_paths.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/utils/validators.dart';
import '../../../core/widgets/app_button.dart';
import '../../../core/widgets/app_text_field.dart';
import '../../../shared/models/user_profile.dart';
import '../providers/auth_provider.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();

  UserRole _selectedPortal = UserRole.student;
  bool _isLoading = false;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _handleEmailLogin() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _isLoading = true);

    final success = await ref.read(authStateProvider.notifier).signInWithEmail(
          _emailController.text.trim(),
          _passwordController.text,
        );

    if (!mounted) return;
    setState(() => _isLoading = false);

    if (success) {
      _navigateBasedOnRole();
    } else if (mounted) {
      final error = ref.read(authStateProvider).error;
      String errorMsg = 'Invalid credentials. Please verify your email and password.';
      if (error is AuthException) {
        if (error.message.toLowerCase().contains('email not confirmed')) {
          errorMsg = 'Your email is not confirmed yet. Please check your inbox or ask the institute administrator to verify your account.';
        } else {
          errorMsg = error.message;
        }
      } else if (error is Exception) {
        errorMsg = error.toString().replaceAll('Exception: ', '');
      }

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(errorMsg),
          backgroundColor: AppColors.error,
          duration: const Duration(seconds: 5),
        ),
      );
    }
  }

  void _navigateBasedOnRole() {
    final user = ref.read(authStateProvider).asData?.value;
    if (user == null) return;

    // 1. Admin accounts are restricted from mobile app
    if (user.role.isAdmin) {
      ref.read(authStateProvider.notifier).signOut();
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text(
            'Administrator accounts must use the Master Web Admin Console. Mobile access is strictly for Students and Faculty.',
          ),
          backgroundColor: AppColors.error,
          duration: Duration(seconds: 4),
        ),
      );
      return;
    }

    // 2. Seamless automatic portal routing based on authenticated account role
    if (user.role.isFaculty) {
      context.go(RoutePaths.facultyShell);
    } else {
      context.go(RoutePaths.studentShell);
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark ? AppColors.darkBackground : AppColors.lightBackground,
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: AppSpacing.p24,
            child: Form(
              key: _formKey,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  // Institute Emblem
                  Center(
                    child: Container(
                      width: 64,
                      height: 64,
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(
                          colors: [AppColors.primaryIndigo, AppColors.primary400],
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                        ),
                        borderRadius: BorderRadius.circular(18),
                        boxShadow: [
                          BoxShadow(
                            color: AppColors.primaryIndigo.withOpacity(0.35),
                            blurRadius: 16,
                            offset: const Offset(0, 6),
                          ),
                        ],
                      ),
                      child: const Center(
                        child: Text(
                          'OCI',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 22,
                            fontWeight: FontWeight.w900,
                            letterSpacing: 1.2,
                          ),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 18),

                  Text(
                    AppConstants.appName,
                    textAlign: TextAlign.center,
                    style: AppTypography.headlineMedium(
                      color: isDark ? AppColors.darkTextPrimary : AppColors.lightTextPrimary,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    'Premier Coaching for OPSC, OSSC, Banking & Central Exams',
                    textAlign: TextAlign.center,
                    style: AppTypography.bodySmall(
                      color: isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
                    ),
                  ),
                  const SizedBox(height: 28),

                  // Explicit Portal Selection: Student vs Faculty
                  Container(
                    padding: const EdgeInsets.all(4),
                    decoration: BoxDecoration(
                      color: isDark ? AppColors.darkSurface : AppColors.lightSurface,
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(
                        color: isDark ? AppColors.darkBorder : AppColors.lightBorder,
                      ),
                    ),
                    child: Row(
                      children: [
                        Expanded(
                          child: GestureDetector(
                            onTap: () => setState(() => _selectedPortal = UserRole.student),
                            child: AnimatedContainer(
                              duration: const Duration(milliseconds: 200),
                              padding: const EdgeInsets.symmetric(vertical: 11),
                              decoration: BoxDecoration(
                                color: _selectedPortal == UserRole.student
                                    ? AppColors.primaryIndigo
                                    : Colors.transparent,
                                borderRadius: BorderRadius.circular(10),
                              ),
                              child: Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Icon(
                                    LucideIcons.graduationCap,
                                    size: 16,
                                    color: _selectedPortal == UserRole.student
                                        ? Colors.white
                                        : (isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary),
                                  ),
                                  const SizedBox(width: 8),
                                  Text(
                                    'Student Portal',
                                    style: AppTypography.labelMedium(
                                      color: _selectedPortal == UserRole.student
                                          ? Colors.white
                                          : (isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ),
                        Expanded(
                          child: GestureDetector(
                            onTap: () => setState(() => _selectedPortal = UserRole.faculty),
                            child: AnimatedContainer(
                              duration: const Duration(milliseconds: 200),
                              padding: const EdgeInsets.symmetric(vertical: 11),
                              decoration: BoxDecoration(
                                color: _selectedPortal == UserRole.faculty
                                    ? AppColors.primaryIndigo
                                    : Colors.transparent,
                                borderRadius: BorderRadius.circular(10),
                              ),
                              child: Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Icon(
                                    LucideIcons.userCheck,
                                    size: 16,
                                    color: _selectedPortal == UserRole.faculty
                                        ? Colors.white
                                        : (isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary),
                                  ),
                                  const SizedBox(width: 8),
                                  Text(
                                    'Faculty Portal',
                                    style: AppTypography.labelMedium(
                                      color: _selectedPortal == UserRole.faculty
                                          ? Colors.white
                                          : (isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),

                  // Email input
                  AppTextField(
                    label: _selectedPortal == UserRole.student
                        ? 'Student Email'
                        : 'Faculty Institutional Email',
                    hint: _selectedPortal == UserRole.student
                        ? 'student@example.com'
                        : 'faculty@oci.org.in',
                    controller: _emailController,
                    prefixIcon: const Icon(LucideIcons.mail),
                    keyboardType: TextInputType.emailAddress,
                    validator: AppValidators.email,
                  ),
                  const SizedBox(height: 16),

                  // Password input
                  AppTextField(
                    label: 'Password',
                    hint: '••••••••',
                    controller: _passwordController,
                    prefixIcon: const Icon(LucideIcons.lock),
                    isPassword: true,
                    validator: AppValidators.password,
                  ),
                  const SizedBox(height: 24),

                  // Submit button
                  AppButton(
                    label: _selectedPortal == UserRole.student
                        ? 'Sign In to Student Portal'
                        : 'Sign In to Faculty Portal',
                    variant: AppButtonVariant.primary,
                    isFullWidth: true,
                    isLoading: _isLoading,
                    onPressed: _handleEmailLogin,
                  ),
                  const SizedBox(height: 24),

                  // Student registration link (Students only)
                  if (_selectedPortal == UserRole.student) ...[
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          'New aspirant? ',
                          style: AppTypography.bodySmall(
                            color: isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
                          ),
                        ),
                        GestureDetector(
                          onTap: () => context.push(RoutePaths.signup),
                          child: Text(
                            'Register as Student',
                            style: AppTypography.titleSmall(
                              color: AppColors.primaryIndigo,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ] else ...[
                    // Notice for faculty: Accounts are provisioned by Administration
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                      decoration: BoxDecoration(
                        color: isDark ? AppColors.darkSurface : AppColors.lightSurface,
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(
                          color: isDark ? AppColors.darkBorder : AppColors.lightBorder,
                        ),
                      ),
                      child: Row(
                        children: [
                          const Icon(LucideIcons.shieldAlert, size: 16, color: AppColors.accentAmber),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              'Faculty accounts are provisioned by the OCI Master Administration. Self-registration is disabled.',
                              style: AppTypography.labelSmall(
                                color: isDark ? AppColors.darkTextMuted : AppColors.lightTextMuted,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
