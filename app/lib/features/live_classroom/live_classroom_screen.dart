import 'dart:async';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_spacing.dart';
import '../../core/theme/app_typography.dart';
import '../../core/widgets/live_badge.dart';

class LiveClassroomScreen extends StatefulWidget {
  final String classId;
  final String title;
  final String teacher;
  final bool isHost;

  const LiveClassroomScreen({
    super.key,
    required this.classId,
    required this.title,
    required this.teacher,
    this.isHost = false,
  });

  @override
  State<LiveClassroomScreen> createState() => _LiveClassroomScreenState();
}

class _LiveClassroomScreenState extends State<LiveClassroomScreen> {
  bool _isMicOn = true;
  bool _isCameraOn = true;
  bool _isHandRaised = false;
  bool _isChatExpanded = false;
  int _elapsedSeconds = 2530; // 42 mins 10 secs
  Timer? _timer;

  final TextEditingController _chatController = TextEditingController();
  final List<Map<String, String>> _messages = [
    {'sender': 'Dr. H. C. Verma', 'text': 'Welcome students. Let us solve the Gauss Law electric flux problem.', 'isFaculty': 'true'},
    {'sender': 'Aarav Sharma', 'text': 'Sir, will the flux be zero through the closed hemisphere?', 'isFaculty': 'false'},
    {'sender': 'Ananya Patra', 'text': 'Net flux depends only on internal enclosed charge q/ε₀.', 'isFaculty': 'false'},
    {'sender': 'Dr. H. C. Verma', 'text': 'Exactly right Ananya! See equation on the smart whiteboard.', 'isFaculty': 'true'},
  ];

  @override
  void initState() {
    super.initState();
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (mounted) setState(() => _elapsedSeconds++);
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    _chatController.dispose();
    super.dispose();
  }

  String _formatElapsed(int sec) {
    final m = (sec ~/ 60).toString().padLeft(2, '0');
    final s = (sec % 60).toString().padLeft(2, '0');
    return '$m:$s';
  }

  void _sendMessage() {
    final text = _chatController.text.trim();
    if (text.isEmpty) return;
    setState(() {
      _messages.add({
        'sender': widget.isHost ? widget.teacher : 'You (Student)',
        'text': text,
        'isFaculty': widget.isHost ? 'true' : 'false',
      });
      _chatController.clear();
    });
  }

  void _confirmLeave() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppColors.darkSurface,
        title: Text(widget.isHost ? 'End Live Session?' : 'Leave Classroom?', style: AppTypography.titleMedium(color: Colors.white)),
        content: Text(
          widget.isHost
              ? 'This will disconnect all 42 connected students and end the broadcast.'
              : 'You will leave the active live class. You can rejoin at any time.',
          style: AppTypography.bodySmall(color: Colors.white70),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.error),
            onPressed: () {
              Navigator.pop(ctx);
              context.pop();
            },
            child: Text(widget.isHost ? 'End Class' : 'Leave Class', style: const TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF090D16),
      body: SafeArea(
        child: Column(
          children: [
            // Top Live Control Bar
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
              color: const Color(0xFF0F172A),
              child: Row(
                children: [
                  const LiveBadge(label: 'LIVE'),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          widget.title,
                          style: AppTypography.titleSmall(color: Colors.white),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        Text(
                          '${widget.teacher} • ${_formatElapsed(_elapsedSeconds)}',
                          style: AppTypography.labelSmall(color: Colors.white70),
                        ),
                      ],
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: AppColors.success.withOpacity(0.15),
                      borderRadius: AppSpacing.radiusFull,
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(LucideIcons.wifi, size: 12, color: AppColors.success),
                        const SizedBox(width: 4),
                        Text('1080p HD', style: AppTypography.labelSmall(color: AppColors.success)),
                      ],
                    ),
                  ),
                  const SizedBox(width: 10),
                  IconButton(
                    icon: const Icon(LucideIcons.phoneOff, color: AppColors.error, size: 22),
                    onPressed: _confirmLeave,
                  ),
                ],
              ),
            ),

            // Video / Whiteboard Stream Viewport
            Expanded(
              flex: _isChatExpanded ? 3 : 6,
              child: Stack(
                fit: StackFit.expand,
                children: [
                  // Video stage placeholder with realistic smartboard graphics
                  Container(
                    decoration: const BoxDecoration(
                      gradient: RadialGradient(
                        colors: [Color(0xFF1E293B), Color(0xFF0B0F19)],
                        radius: 0.9,
                      ),
                    ),
                    child: Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Container(
                            padding: const EdgeInsets.all(20),
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              color: AppColors.primary500.withOpacity(0.15),
                              border: Border.all(color: AppColors.primary500.withOpacity(0.3), width: 2),
                            ),
                            child: const Icon(LucideIcons.monitorPlay, size: 48, color: AppColors.primary400),
                          ),
                          const SizedBox(height: 14),
                          Text(
                            widget.isHost ? 'You are broadcasting live' : 'Interactive Whiteboard & HD Feed',
                            style: AppTypography.titleMedium(color: Colors.white),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            'Gauss Law: ∮ E·dA = q_enc / ε₀',
                            style: AppTypography.titleSmall(color: AppColors.accentCyan),
                          ),
                        ],
                      ),
                    ),
                  ),

                  // Floating Presenter Badge
                  Positioned(
                    bottom: 12,
                    left: 12,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                      decoration: BoxDecoration(
                        color: Colors.black.withOpacity(0.7),
                        borderRadius: AppSpacing.radius8,
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            widget.isHost ? LucideIcons.crown : LucideIcons.user,
                            size: 14,
                            color: AppColors.accentAmber,
                          ),
                          const SizedBox(width: 6),
                          Text(
                            widget.isHost ? 'Presenter: You' : 'Presenter: ${widget.teacher}',
                            style: AppTypography.labelSmall(color: Colors.white),
                          ),
                        ],
                      ),
                    ),
                  ),

                  // 42 Attendees Badge
                  Positioned(
                    top: 12,
                    right: 12,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                      decoration: BoxDecoration(
                        color: Colors.black.withOpacity(0.6),
                        borderRadius: AppSpacing.radiusFull,
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(LucideIcons.users, size: 13, color: Colors.white),
                          const SizedBox(width: 5),
                          Text('42 Enrolled', style: AppTypography.labelSmall(color: Colors.white)),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),

            // Live Chat Panel
            Expanded(
              flex: _isChatExpanded ? 5 : 4,
              child: Container(
                color: const Color(0xFF0F172A),
                child: Column(
                  children: [
                    // Chat header
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Row(
                            children: [
                              const Icon(LucideIcons.messageSquare, size: 16, color: AppColors.accentCyan),
                              const SizedBox(width: 8),
                              Text('Live Classroom Chat & Doubts', style: AppTypography.titleSmall(color: Colors.white)),
                            ],
                          ),
                          IconButton(
                            icon: Icon(
                              _isChatExpanded ? LucideIcons.minimize2 : LucideIcons.maximize2,
                              size: 16,
                              color: Colors.white70,
                            ),
                            onPressed: () => setState(() => _isChatExpanded = !_isChatExpanded),
                          ),
                        ],
                      ),
                    ),
                    const Divider(color: Colors.white10, height: 1),

                    // Message list
                    Expanded(
                      child: ListView.builder(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                        itemCount: _messages.length,
                        itemBuilder: (context, index) {
                          final msg = _messages[index];
                          final isFaculty = msg['isFaculty'] == 'true';

                          return Padding(
                            padding: const EdgeInsets.only(bottom: 8),
                            child: RichText(
                              text: TextSpan(
                                children: [
                                  TextSpan(
                                    text: '${msg['sender']}: ',
                                    style: TextStyle(
                                      color: isFaculty ? AppColors.accentAmber : AppColors.accentCyan,
                                      fontWeight: FontWeight.w600,
                                      fontSize: 13,
                                    ),
                                  ),
                                  TextSpan(
                                    text: msg['text'],
                                    style: const TextStyle(
                                      color: Colors.white,
                                      fontSize: 13,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          );
                        },
                      ),
                    ),

                    // Chat input field
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                      decoration: const BoxDecoration(
                        color: Color(0xFF1E293B),
                        border: Border(top: BorderSide(color: Colors.white10)),
                      ),
                      child: Row(
                        children: [
                          Expanded(
                            child: TextField(
                              controller: _chatController,
                              style: const TextStyle(color: Colors.white, fontSize: 13),
                              decoration: const InputDecoration(
                                hintText: 'Ask a doubt to Dr. Verma...',
                                hintStyle: TextStyle(color: Colors.white38, fontSize: 13),
                                border: InputBorder.none,
                                contentPadding: EdgeInsets.zero,
                              ),
                              onSubmitted: (_) => _sendMessage(),
                            ),
                          ),
                          IconButton(
                            icon: const Icon(LucideIcons.send, color: AppColors.primary400, size: 18),
                            onPressed: _sendMessage,
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),

            // Classroom Bottom Control Bar
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              color: const Color(0xFF090D16),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  _buildToolButton(
                    icon: _isMicOn ? LucideIcons.mic : LucideIcons.micOff,
                    isActive: _isMicOn,
                    activeColor: Colors.white24,
                    inactiveColor: AppColors.error,
                    label: _isMicOn ? 'Mute' : 'Unmute',
                    onTap: () => setState(() => _isMicOn = !_isMicOn),
                  ),
                  _buildToolButton(
                    icon: _isCameraOn ? LucideIcons.video : LucideIcons.videoOff,
                    isActive: _isCameraOn,
                    activeColor: Colors.white24,
                    inactiveColor: AppColors.error,
                    label: _isCameraOn ? 'Camera' : 'Off',
                    onTap: () => setState(() => _isCameraOn = !_isCameraOn),
                  ),
                  if (!widget.isHost)
                    _buildToolButton(
                      icon: LucideIcons.hand,
                      isActive: _isHandRaised,
                      activeColor: AppColors.accentAmber,
                      inactiveColor: Colors.white24,
                      label: _isHandRaised ? 'Raised' : 'Raise',
                      onTap: () {
                        setState(() => _isHandRaised = !_isHandRaised);
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text(_isHandRaised ? 'Hand raised. Mentor notified.' : 'Hand lowered.'),
                            duration: const Duration(seconds: 1),
                          ),
                        );
                      },
                    ),
                  _buildToolButton(
                    icon: LucideIcons.phoneOff,
                    isActive: true,
                    activeColor: AppColors.error,
                    inactiveColor: AppColors.error,
                    label: 'Leave',
                    onTap: _confirmLeave,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildToolButton({
    required IconData icon,
    required bool isActive,
    required Color activeColor,
    required Color inactiveColor,
    required String label,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: AppSpacing.radiusFull,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: isActive ? activeColor : inactiveColor,
            ),
            child: Icon(icon, color: Colors.white, size: 20),
          ),
          const SizedBox(height: 4),
          Text(label, style: const TextStyle(color: Colors.white70, fontSize: 11)),
        ],
      ),
    );
  }
}
