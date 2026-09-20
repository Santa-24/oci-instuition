import 'package:shared_preferences/shared_preferences.dart';

/// Local preferences storage for auth session, active role cache, and theme mode.
class PreferencesService {
  PreferencesService._();

  static const String _keySelectedRole = 'intuition_cached_role';
  static const String _keyThemeMode = 'intuition_theme_mode';
  static const String _keyOnboarded = 'intuition_onboarded_completed';
  static const String _keyUserId = 'intuition_cached_user_id';

  static Future<void> initialize() async {
    await SharedPreferences.getInstance();
  }

  static Future<void> saveSelectedRole(String role) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_keySelectedRole, role);
  }

  static Future<String?> getSelectedRole() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_keySelectedRole);
  }

  static Future<void> saveUserId(String userId) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_keyUserId, userId);
  }

  static Future<String?> getUserId() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_keyUserId);
  }

  static Future<void> saveThemeMode(String mode) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_keyThemeMode, mode);
  }

  static Future<String?> getThemeMode() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_keyThemeMode);
  }

  static Future<void> setOnboarded(bool value) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(_keyOnboarded, value);
  }

  static Future<bool> isOnboarded() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getBool(_keyOnboarded) ?? false;
  }

  static Future<void> clearSession() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_keySelectedRole);
    await prefs.remove(_keyUserId);
  }
}
