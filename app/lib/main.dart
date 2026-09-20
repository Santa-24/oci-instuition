import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'app.dart';
import 'core/network/supabase_service.dart';
import 'core/storage/preferences_service.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Set preferred orientations for mobile portrait experience
  await SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
    DeviceOrientation.portraitDown,
  ]);

  // Set system UI overlay style for modern transparent status bar
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.dark,
      statusBarBrightness: Brightness.light,
    ),
  );

  // Load environment variables safely
  try {
    await dotenv.load(fileName: '.env');
  } catch (_) {
    // Falls back to Env class defaults if .env file is omitted in local dev
  }

  // Initialize persistent storage and Supabase backend service
  try {
    await PreferencesService.initialize();
  } catch (_) {}

  try {
    await SupabaseService.initialize();
  } catch (_) {}

  runApp(
    const ProviderScope(
      child: IntuitionApp(),
    ),
  );
}
