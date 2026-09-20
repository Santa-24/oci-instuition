import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';

/// In-memory & local persistent cache for offline resilience.
class CacheManager {
  static final CacheManager _instance = CacheManager._internal();
  factory CacheManager() => _instance;
  CacheManager._internal();

  final Map<String, dynamic> _memoryCache = {};

  void setMemory(String key, dynamic value) {
    _memoryCache[key] = value;
  }

  T? getMemory<T>(String key) {
    return _memoryCache[key] as T?;
  }

  Future<void> setPersistent(String key, Map<String, dynamic> data) async {
    _memoryCache[key] = data;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('cache_$key', jsonEncode(data));
  }

  Future<Map<String, dynamic>?> getPersistent(String key) async {
    if (_memoryCache.containsKey(key)) {
      return _memoryCache[key] as Map<String, dynamic>?;
    }
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString('cache_$key');
    if (raw == null) return null;
    try {
      final decoded = jsonDecode(raw) as Map<String, dynamic>;
      _memoryCache[key] = decoded;
      return decoded;
    } catch (_) {
      return null;
    }
  }

  void clearAll() {
    _memoryCache.clear();
  }
}
