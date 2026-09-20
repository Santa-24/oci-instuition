import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../../core/config/app_constants.dart';
import '../../../core/network/supabase_service.dart';
import '../../../core/router/route_paths.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/utils/validators.dart';
import '../../../core/widgets/app_button.dart';
import '../../../core/widgets/app_text_field.dart';
import '../../../shared/models/user_profile.dart';
import '../providers/auth_provider.dart';

class SignupScreen extends ConsumerStatefulWidget {
  const SignupScreen({super.key});

  @override
  ConsumerState<SignupScreen> createState() => _SignupScreenState();
}

class _SignupScreenState extends ConsumerState<SignupScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _phoneController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();

  String _selectedExam = 'OSSC CGL & State Combined';
  bool _agreedToTerms = false;
  bool _isLoading = false;

  final List<String> _targetExams = [
    'OSSC CGL & State Combined',
    'OSSSC RI, ARI & Amin',
    'Odisha Police SI & Constable',
    'SSC CGL & CHSL (Tier 1 & 2)',
    'Banking PO & Clerk (IBPS/SBI)',
    'Railway RRB NTPC & Group D',
    'JEE Advanced Comprehensive',
    'NEET Medical Pioneer',
  ];

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  Future<void> _handleSignup() async {
    if (!_formKey.currentState!.validate()) return;

    if (!_agreedToTerms) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please accept the Terms of Service to continue.'),
          backgroundColor: AppColors.warning,
        ),
      );
      return;
    }

    if (_passwordController.text != _confirmPasswordController.text) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Passwords do not match.'),
          backgroundColor: AppColors.error,
        ),
      );
      return;
    }

    setState(() => _isLoading = true);

    final success = await ref.read(authStateProvider.notifier).signUpWithEmail(
          fullName: _nameController.text.trim(),
          email: _emailController.text.trim(),
          phone: _phoneController.text.trim(),
          password: _passwordController.text,
          role: UserRole.student,
          targetExamOrSubject: _selectedExam,
        );

    if (!mounted) return;
    setState(() => _isLoading = false);

    if (success) {
      final hasActiveSession = SupabaseService.client.auth.currentSession != null;
      if (hasActiveSession) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text(
              'Welcome to ${AppConstants.appName}! Your student account is active.',
            ),
            backgroundColor: AppColors.success,
          ),
        );
        context.go(RoutePaths.studentShell);
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text(
              'Registration successful! Please check your email to confirm your account, then log in.',
            ),
            backgroundColor: AppColors.success,
            duration: Duration(seconds: 6),
          ),
        );
        context.go(RoutePaths.login);
      }
    } else if (mounted) {
      final error = ref.read(authStateProvider).error;
      String errorMsg = 'Registration failed. Please check your details and try again.';
      if (error is AuthException) {
        errorMsg = error.message;
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

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark ? AppColors.darkBackground : AppColors.lightBackground,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: Icon(
            LucideIcons.arrowLeft,
            color: isDark ? AppColors.darkTextPrimary : AppColors.lightTextPrimary,
          ),
          onPressed: () => context.pop(),
        ),
        title: Text(
          'Student Registration',
          style: AppTypography.titleMedium(
            color: isDark ? AppColors.darkTextPrimary : AppColors.lightTextPrimary,
          ),
        ),
        centerTitle: true,
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: AppSpacing.p24,
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // Header badge
                Center(
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                    decoration: BoxDecoration(
                      color: AppColors.primaryIndigo.withOpacity(0.12),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(
                        color: AppColors.primaryIndigo.withOpacity(0.3),
                      ),
                    ),
                    child: Text(
                      'OFFICIAL STUDENT ENROLLMENT',
                      style: AppTypography.labelSmall(color: AppColors.primaryIndigo),
                    ),
                  ),
                ),
                const SizedBox(height: 16),

                Text(
                  'Join ${AppConstants.appName}',
                  textAlign: TextAlign.center,
                  style: AppTypography.headlineMedium(
                    color: isDark ? AppColors.darkTextPrimary : AppColors.lightTextPrimary,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  'Odisha’s Premier Institute for Competitive Examination Coaching',
                  textAlign: TextAlign.center,
                  style: AppTypography.bodySmall(
                    color: isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
                  ),
                ),
                const SizedBox(height: 24),

                // Full Name
                AppTextField(
                  label: 'Full Legal Name',
                  hint: 'Enter your full name',
                  controller: _nameController,
                  prefixIcon: const Icon(LucideIcons.user),
                  validator: (val) {
                    if (val == null || val.trim().length < 2) {
                      return 'Please enter your full legal name';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 16),

                // Email Address
                AppTextField(
                  label: 'Email Address',
                  hint: 'student@example.com',
                  controller: _emailController,
                  prefixIcon: const Icon(LucideIcons.mail),
                  keyboardType: TextInputType.emailAddress,
                  validator: AppValidators.email,
                ),
                const SizedBox(height: 16),

                // Mobile Phone
                AppTextField(
                  label: 'Mobile Number',
                  hint: '+91 94370 12345',
                  controller: _phoneController,
                  prefixIcon: const Icon(LucideIcons.phone),
                  keyboardType: TextInputType.phone,
                  validator: AppValidators.phone,
                ),
                const SizedBox(height: 16),

                // Target Program Dropdown
                Text(
                  'Target Competitive Examination',
                  style: AppTypography.titleSmall(
                    color: isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
                  ),
                ),
                const SizedBox(height: 6),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
                  decoration: BoxDecoration(
                    color: isDark ? AppColors.darkSurface : AppColors.lightSurface,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(
                      color: isDark ? AppColors.darkBorder : AppColors.lightBorder,
                    ),
                  ),
                  child: DropdownButtonHideUnderline(
                    child: DropdownButton<String>(
                      value: _selectedExam,
                      isExpanded: true,
                      dropdownColor: isDark ? AppColors.darkSurface : AppColors.lightSurface,
                      style: AppTypography.bodyMedium(
                        color: isDark ? AppColors.darkTextPrimary : AppColors.lightTextPrimary,
                      ),
                      icon: const Icon(LucideIcons.chevronDown, size: 18),
                      items: _targetExams.map((exam) {
                        return DropdownMenuItem<String>(
                          value: exam,
                          child: Text(exam),
                        );
                      }).toList(),
                      onChanged: (val) {
                        if (val != null) setState(() => _selectedExam = val);
                      },
                    ),
                  ),
                ),
                const SizedBox(height: 16),

                // Password
                AppTextField(
                  label: 'Password',
                  hint: '••••••••',
                  controller: _passwordController,
                  prefixIcon: const Icon(LucideIcons.lock),
                  isPassword: true,
                  validator: AppValidators.password,
                ),
                const SizedBox(height: 16),

                // Confirm Password
                AppTextField(
                  label: 'Confirm Password',
                  hint: '••••••••',
                  controller: _confirmPasswordController,
                  prefixIcon: const Icon(LucideIcons.lock),
                  isPassword: true,
                  validator: (val) {
                    if (val == null || val.isEmpty) {
                      return 'Please confirm your password';
                    }
                    if (val != _passwordController.text) {
                      return 'Passwords do not match';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 16),

                // Terms and Conditions checkbox
                Row(
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    Checkbox(
                      value: _agreedToTerms,
                      activeColor: AppColors.primaryIndigo,
                      onChanged: (val) => setState(() => _agreedToTerms = val ?? false),
                    ),
                    Expanded(
                      child: Text(
                        'I agree to the OCI Academic Guidelines, Attendance Mandate, and Terms of Service.',
                        style: AppTypography.bodySmall(
                          color: isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 24),

                // Submit Button
                AppButton(
                  label: 'Complete Student Registration',
                  variant: AppButtonVariant.primary,
                  isFullWidth: true,
                  isLoading: _isLoading,
                  onPressed: _handleSignup,
                ),
                const SizedBox(height: 16),

                // Back to Login link
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      'Already registered? ',
                      style: AppTypography.bodySmall(
                        color: isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
                      ),
                    ),
                    GestureDetector(
                      onTap: () => context.go(RoutePaths.login),
                      child: Text(
                        'Sign In',
                        style: AppTypography.titleSmall(
                          color: AppColors.primaryIndigo,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 24),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
