import 'dart:io';
import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../config/app_constants.dart';
import '../config/env.dart';
import '../network/api_client.dart';

/// Manages in-app automatic update checks, downloads, and package installer invocations.
class AppUpdateService {
  AppUpdateService._();

  static const MethodChannel _updaterChannel =
      MethodChannel('com.oci.institute/updater');

  static DateTime? _lastCheckTime;
  static const Duration _throttleInterval = Duration(minutes: 30);

  /// Performs an asynchronous update check against the OCI backend.
  static Future<void> checkForUpdates(
    BuildContext context, {
    bool isManual = false,
  }) async {
    // Throttle automated checks on resume
    if (!isManual &&
        _lastCheckTime != null &&
        DateTime.now().difference(_lastCheckTime!) < _throttleInterval) {
      return;
    }
    _lastCheckTime = DateTime.now();

    try {
      final dio = ApiClient().dio;
      final response = await dio.get('${Env.backendUrl}/api/app/version/android');

      if (response.statusCode != 200 || response.data == null) {
        if (isManual && context.mounted) {
          _showSnackbar(context, 'Unable to check for updates. Check your connection.');
        }
        return;
      }

      final data = response.data as Map<String, dynamic>;
      final serverVersionCode = (data['versionCode'] as num?)?.toInt() ?? 0;
      final serverVersionName = data['latestVersion'] as String? ?? '1.0.0';
      final isMandatory = data['mandatory'] == true;
      final apkUrl = data['apkUrl'] as String?;
      final releaseNotes = (data['releaseNotes'] as List<dynamic>?)
              ?.map((e) => e.toString())
              .toList() ??
          [];

      if (serverVersionCode > AppConstants.currentVersionCode &&
          apkUrl != null &&
          context.mounted) {
        if (isMandatory) {
          _showMandatoryUpdateDialog(
            context,
            serverVersionName,
            serverVersionCode,
            apkUrl,
            releaseNotes,
          );
        } else {
          _showFlexibleUpdateDialog(
            context,
            serverVersionName,
            serverVersionCode,
            apkUrl,
            releaseNotes,
          );
        }
      } else if (isManual && context.mounted) {
        _showSnackbar(
          context,
          'You are on the latest version of OCI (v${AppConstants.currentVersionName}).',
        );
      }
    } catch (e) {
      debugPrint('[AppUpdateService] Notice: $e');
      if (isManual && context.mounted) {
        _showSnackbar(context, 'Unable to connect to update server.');
      }
    }
  }

  static void _showSnackbar(BuildContext context, String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message, style: const TextStyle(fontSize: 13)),
        behavior: SnackBarBehavior.floating,
        duration: const Duration(seconds: 3),
      ),
    );
  }

  /// Displays non-dismissible mandatory update dialog
  static void _showMandatoryUpdateDialog(
    BuildContext context,
    String versionName,
    int versionCode,
    String apkUrl,
    List<String> releaseNotes,
  ) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => PopScope(
        canPop: false,
        child: AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          title: Row(
            children: const [
              Icon(Icons.warning_amber_rounded, color: Colors.amber, size: 28),
              SizedBox(width: 8),
              Expanded(
                child: Text(
                  'Critical Update Required',
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
                ),
              ),
            ],
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'A new version of OCI (v$versionName) is required to continue preparing for your examinations.',
                style: const TextStyle(fontSize: 13, height: 1.4),
              ),
              const SizedBox(height: 12),
              const Text(
                'What’s New:',
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
              ),
              const SizedBox(height: 6),
              ...releaseNotes.map(
                (n) => Padding(
                  padding: const EdgeInsets.only(bottom: 4),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('• ', style: TextStyle(color: Colors.amber)),
                      Expanded(
                        child: Text(n, style: const TextStyle(fontSize: 12)),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
          actions: [
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFFE5A93C),
                foregroundColor: Colors.black87,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(10),
                ),
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
              ),
              onPressed: () {
                Navigator.of(ctx).pop();
                _downloadAndInstallApk(context, apkUrl, versionName);
              },
              child: const Text('Update Now', style: TextStyle(fontWeight: FontWeight.bold)),
            ),
          ],
        ),
      ),
    );
  }

  /// Displays standard optional update prompt
  static void _showFlexibleUpdateDialog(
    BuildContext context,
    String versionName,
    int versionCode,
    String apkUrl,
    List<String> releaseNotes,
  ) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Row(
          children: const [
            Icon(Icons.system_update_rounded, color: Color(0xFF1E3A8A), size: 26),
            SizedBox(width: 8),
            Text('New Version Available', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 17)),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'OCI v$versionName (Build $versionCode) is now available for download.',
              style: const TextStyle(fontSize: 13),
            ),
            const SizedBox(height: 12),
            const Text('Highlights:', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
            const SizedBox(height: 6),
            ...releaseNotes.take(4).map(
                  (n) => Padding(
                    padding: const EdgeInsets.only(bottom: 4),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('• ', style: TextStyle(color: Colors.blue)),
                        Expanded(child: Text(n, style: const TextStyle(fontSize: 12))),
                      ],
                    ),
                  ),
                ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(),
            child: const Text('Later', style: TextStyle(color: Colors.grey)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF1E3A8A),
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            ),
            onPressed: () {
              Navigator.of(ctx).pop();
              _downloadAndInstallApk(context, apkUrl, versionName);
            },
            child: const Text('Update Now'),
          ),
        ],
      ),
    );
  }

  /// Handles background download and installer trigger
  static Future<void> _downloadAndInstallApk(
    BuildContext context,
    String apkUrl,
    String versionName,
  ) async {
    final progressNotifier = ValueNotifier<double>(0.0);

    // Show Progress Dialog
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => PopScope(
        canPop: false,
        child: AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          title: const Text('Downloading OCI Update', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          content: ValueListenableBuilder<double>(
            valueListenable: progressNotifier,
            builder: (ctx, progress, _) {
              return Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  LinearProgressIndicator(
                    value: progress > 0 ? progress : null,
                    backgroundColor: Colors.grey.shade200,
                    valueColor: const AlwaysStoppedAnimation<Color>(Color(0xFFE5A93C)),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    progress > 0
                        ? '${(progress * 100).toStringAsFixed(1)}% Downloaded'
                        : 'Connecting to secure download server...',
                    style: const TextStyle(fontSize: 12, color: Colors.grey),
                  ),
                ],
              );
            },
          ),
        ),
      ),
    );

    try {
      final tempDir = Directory.systemTemp;
      final savePath = '${tempDir.path}/OCI-v$versionName.apk';

      final dio = Dio();
      await dio.download(
        apkUrl,
        savePath,
        onReceiveProgress: (received, total) {
          if (total > 0) {
            progressNotifier.value = received / total;
          }
        },
      );

      // Close progress dialog
      if (context.mounted) {
        Navigator.of(context, rootNavigator: true).pop();
      }

      // Launch Native Android Package Installer
      await _updaterChannel.invokeMethod('installApk', {'filePath': savePath});
    } catch (e) {
      if (context.mounted) {
        Navigator.of(context, rootNavigator: true).pop();
        _showSnackbar(context, 'Download failed: $e. Please try again.');
      }
    }
  }
}
