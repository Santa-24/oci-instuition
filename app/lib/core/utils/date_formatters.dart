import 'package:intl/intl.dart';

/// Formatting utilities for dates, times, durations, and exam timers.
class AppFormatters {
  AppFormatters._();

  static final DateFormat _readableDate = DateFormat('dd MMM yyyy');
  static final DateFormat _shortDate = DateFormat('dd MMM');
  static final DateFormat _timeOnly = DateFormat('hh:mm a');
  static final DateFormat _fullDateTime = DateFormat('dd MMM yyyy, hh:mm a');

  static String formatDate(DateTime? date) {
    if (date == null) return 'N/A';
    return _readableDate.format(date);
  }

  static String formatShortDate(DateTime? date) {
    if (date == null) return 'N/A';
    return _shortDate.format(date);
  }

  static String formatTime(DateTime? date) {
    if (date == null) return 'N/A';
    return _timeOnly.format(date);
  }

  static String formatDateTime(DateTime? date) {
    if (date == null) return 'N/A';
    return _fullDateTime.format(date);
  }

  static String formatDuration(Duration duration) {
    final hours = duration.inHours;
    final minutes = duration.inMinutes.remainder(60);
    final seconds = duration.inSeconds.remainder(60);

    if (hours > 0) {
      return '${hours.toString().padLeft(2, '0')}:${minutes.toString().padLeft(2, '0')}:${seconds.toString().padLeft(2, '0')}';
    }
    return '${minutes.toString().padLeft(2, '0')}:${seconds.toString().padLeft(2, '0')}';
  }

  static String formatTimeOnly(DateTime? date) => formatTime(date);

  static String formatFullDateTime(DateTime? date) => formatDateTime(date);

  static String formatDurationMinutes(int? durationSeconds) {
    if (durationSeconds == null) return '0 mins';
    final minutes = (durationSeconds / 60).round();
    if (minutes < 60) return '$minutes mins';
    final hrs = minutes ~/ 60;
    final remainingMins = minutes % 60;
    return remainingMins > 0 ? '${hrs}h ${remainingMins}m' : '${hrs}h';
  }

  static String parseAndFormatDate(String? isoString) {
    if (isoString == null) return 'N/A';
    try {
      final dt = DateTime.parse(isoString);
      return formatDate(dt);
    } catch (_) {
      return isoString;
    }
  }

  static String parseAndFormatTime(String? isoString) {
    if (isoString == null) return 'N/A';
    try {
      final dt = DateTime.parse(isoString);
      return formatTime(dt);
    } catch (_) {
      return isoString;
    }
  }
}
