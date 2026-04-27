import { useState } from 'react';
import {
  Box, Typography, Paper, TextField, Button, Alert, CircularProgress, LinearProgress,
  ToggleButton, ToggleButtonGroup, Stack, MenuItem,
} from '@mui/material';
import {
  Analytics as AnalyticsIcon, Work as WorkIcon,
  UploadFile as UploadIcon, Code as CodeIcon, ArrowForward as ArrowIcon,
  AccountCircle as AccountIcon, Logout as LogoutIcon, FolderOpen as SavedIcon,
} from '@mui/icons-material';
import FileDropzone from '../components/upload/FileDropzone';
import type { SavedResume, User } from '../types';

interface Props {
  currentUser: User | null;
  authLoading: boolean;
  savedResumes: SavedResume[];
  selectedSavedResumeId: number | null;
  resumeFile: File | null;
  jobDescription: string;
  isDragOver: boolean;
  loading: boolean;
  error: string;
  onLogin: (email: string, password: string) => Promise<void>;
  onRegister: (name: string, email: string, password: string) => Promise<void>;
  onLogout: () => Promise<void>;
  onSaveResume: () => Promise<void>;
  onSavedResumeChange: (id: number | null) => void;
  onFileChange: (file: File | null) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave: () => void;
  onJobDescriptionChange: (value: string) => void;
  onAnalyze: () => void;
  onPasteLatex: (latex: string) => void;
}

export default function UploadPage({
  currentUser, authLoading, savedResumes, selectedSavedResumeId,
  resumeFile, jobDescription, isDragOver, loading, error,
  onLogin, onRegister, onLogout, onSaveResume, onSavedResumeChange,
  onFileChange, onDrop, onDragOver, onDragLeave,
  onJobDescriptionChange, onAnalyze, onPasteLatex,
}: Props) {
  const [mode, setMode] = useState<'upload' | 'paste'>('upload');
  const [pastedLatex, setPastedLatex] = useState('');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const handleAuthSubmit = async () => {
    setAuthError('');
    try {
      if (authMode === 'register') {
        await onRegister(name, email, password);
      } else {
        await onLogin(email, password);
      }
      setPassword('');
    } catch (err: unknown) {
      setAuthError(err instanceof Error ? err.message : 'Authentication failed');
    }
  };

  const handleSaveResume = async () => {
    setAuthError('');
    setSaveMessage('');
    setSaveLoading(true);
    try {
      await onSaveResume();
      setSaveMessage('Resume saved successfully.');
    } catch (err: unknown) {
      setAuthError(err instanceof Error ? err.message : 'Failed to save resume');
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh', bgcolor: 'background.default',
      display: 'flex', alignItems: 'center', justifyContent: 'center', py: 6,
    }}>
      <Box sx={{ width: '100%', maxWidth: 640, px: 2 }}>

        <Box textAlign="center" mb={5}>
          <Box sx={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 64, height: 64, borderRadius: '50%',
            background: 'linear-gradient(135deg, #2563eb, #7c3aed)', mb: 2,
          }}>
            <AnalyticsIcon sx={{ fontSize: 32, color: 'white' }} />
          </Box>
          <Typography variant="h4" color="text.primary">Resume Analyzer</Typography>
          <Typography variant="body1" color="text.secondary" mt={1}>
            Upload your resume and job description for AI-powered recommendations
          </Typography>
        </Box>

        <Paper elevation={0} sx={{ border: '1px solid', borderColor: '#e2e8f0', borderRadius: 3, overflow: 'hidden', mb: 3 }}>
          <Box sx={{ p: 3, borderBottom: currentUser ? '1px solid #e2e8f0' : 'none' }}>
            <Box display="flex" alignItems="center" gap={1.5} mb={2}>
              <AccountIcon color="primary" />
              <Typography variant="h6">Login & Resume Storage</Typography>
            </Box>

            {currentUser ? (
              <Box display="flex" alignItems="center" justifyContent="space-between" gap={2} flexWrap="wrap">
                <Box>
                  <Typography variant="body1" fontWeight={600}>{currentUser.name}</Typography>
                  <Typography variant="body2" color="text.secondary">{currentUser.email}</Typography>
                </Box>
                <Button
                  variant="outlined"
                  color="inherit"
                  startIcon={<LogoutIcon />}
                  onClick={onLogout}
                  disabled={authLoading}
                >
                  Log out
                </Button>
              </Box>
            ) : (
              <Stack spacing={2}>
                <ToggleButtonGroup
                  exclusive value={authMode}
                  onChange={(_, v) => v && setAuthMode(v)}
                  size="small"
                  sx={{
                    alignSelf: 'flex-start',
                    '& .MuiToggleButton-root': {
                      px: 2, py: 0.75, fontSize: '0.85rem', textTransform: 'none',
                    },
                  }}
                >
                  <ToggleButton value="login">Login</ToggleButton>
                  <ToggleButton value="register">Create account</ToggleButton>
                </ToggleButtonGroup>

                {authMode === 'register' && (
                  <TextField
                    label="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    fullWidth
                  />
                )}
                <TextField
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  fullWidth
                />
                <TextField
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  fullWidth
                />
                {authError && <Alert severity="error">{authError}</Alert>}
                <Button
                  variant="contained"
                  onClick={handleAuthSubmit}
                  disabled={authLoading || !email.trim() || !password.trim() || (authMode === 'register' && !name.trim())}
                  startIcon={authLoading ? <CircularProgress size={18} color="inherit" /> : <AccountIcon />}
                  sx={{
                    alignSelf: 'flex-start',
                    background: 'linear-gradient(90deg, #2563eb 0%, #7c3aed 100%)',
                    '&:hover': { background: 'linear-gradient(90deg, #1d4ed8 0%, #6d28d9 100%)' },
                  }}
                >
                  {authMode === 'register' ? 'Create Account' : 'Login'}
                </Button>
              </Stack>
            )}
          </Box>

          {currentUser && (
            <Box sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" gap={1.5} mb={2}>
                <SavedIcon color="secondary" />
                <Typography variant="subtitle1" fontWeight={600}>Saved Resumes</Typography>
              </Box>
              <TextField
                select
                fullWidth
                value={selectedSavedResumeId ?? ''}
                onChange={(e) => onSavedResumeChange(e.target.value ? Number(e.target.value) : null)}
                SelectProps={{ displayEmpty: true }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: '#f8fafc',
                  },
                }}
              >
                <MenuItem value="">
                  <em>Upload a new PDF for this analysis</em>
                </MenuItem>
                {savedResumes.map((savedResume) => (
                  <MenuItem key={savedResume.id} value={savedResume.id}>
                    {savedResume.filename}
                  </MenuItem>
                ))}
              </TextField>
              <Typography variant="caption" color="text.secondary" mt={1} display="block">
                {savedResumes.length > 0
                  ? 'Choose a saved resume to skip re-uploading, or leave this empty to use a new PDF.'
                  : 'Your saved resumes will show up here after you analyze an uploaded PDF while logged in.'}
              </Typography>
            </Box>
          )}
        </Paper>

        {/* Mode toggle */}
        <Box display="flex" justifyContent="center" mb={3}>
          <ToggleButtonGroup
            exclusive value={mode}
            onChange={(_, v) => v && setMode(v)}
            size="small"
            sx={{
              '& .MuiToggleButton-root': {
                px: 2.5, py: 0.75, fontSize: '0.85rem', textTransform: 'none',
                border: '1px solid #d1d5db', color: '#6b7280', gap: 0.75,
                '&.Mui-selected': { bgcolor: '#4f46e5', color: '#fff', borderColor: '#4f46e5' },
                '&.Mui-selected:hover': { bgcolor: '#4338ca' },
              },
            }}
          >
            <ToggleButton value="upload">
              <UploadIcon sx={{ fontSize: 17 }} /> Upload PDF
            </ToggleButton>
            <ToggleButton value="paste">
              <CodeIcon sx={{ fontSize: 17 }} /> Paste LaTeX
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {mode === 'upload' && (
          <Paper elevation={0} sx={{ border: '1px solid', borderColor: '#e2e8f0', borderRadius: 3, overflow: 'hidden' }}>

            {/* Step 1 */}
            <Box sx={{ p: 3, borderBottom: '1px solid #e2e8f0' }}>
              <Box display="flex" alignItems="center" gap={1.5} mb={2}>
                <Box sx={{
                  width: 26, height: 26, borderRadius: '50%', bgcolor: 'primary.main',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Typography sx={{ color: 'white', fontSize: 12, fontWeight: 700 }}>1</Typography>
                </Box>
                <Typography variant="h6">Upload Your Resume</Typography>
              </Box>
              <FileDropzone
                file={resumeFile}
                isDragOver={isDragOver}
                onFileChange={onFileChange}
                onDrop={onDrop}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
              />
              {currentUser && (
                <Box mt={2}>
                  <Button
                    variant="outlined"
                    onClick={handleSaveResume}
                    disabled={saveLoading || !resumeFile}
                    startIcon={saveLoading ? <CircularProgress size={16} color="inherit" /> : <SavedIcon />}
                  >
                    {saveLoading ? 'Saving...' : 'Save Resume'}
                  </Button>
                  {saveMessage && (
                    <Typography variant="caption" color="success.main" display="block" mt={1}>
                      {saveMessage}
                    </Typography>
                  )}
                </Box>
              )}
            </Box>

            {/* Step 2 */}
            <Box sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" gap={1.5} mb={2}>
                <Box sx={{
                  width: 26, height: 26, borderRadius: '50%', bgcolor: 'secondary.main',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Typography sx={{ color: 'white', fontSize: 12, fontWeight: 700 }}>2</Typography>
                </Box>
                <WorkIcon fontSize="small" color="secondary" />
                <Typography variant="h6">Job Description</Typography>
              </Box>
              <TextField
                fullWidth multiline rows={7}
                placeholder="Paste the full job description here — responsibilities, requirements, preferred qualifications..."
                value={jobDescription}
                onChange={(e) => onJobDescriptionChange(e.target.value)}
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: '#f8fafc', fontSize: '0.9rem',
                    '&:hover fieldset': { borderColor: 'primary.main' },
                  },
                }}
              />
              <Typography variant="caption" color="text.disabled" mt={0.5} display="block">
                {jobDescription.length} characters
              </Typography>
            </Box>

            {/* Action */}
            <Box sx={{ px: 3, pb: 3 }}>
              {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}
              <Button
                variant="contained" fullWidth size="large"
                onClick={onAnalyze}
                disabled={loading || (!resumeFile && !selectedSavedResumeId) || !jobDescription.trim()}
                startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <AnalyticsIcon />}
                sx={{
                  py: 1.5, fontSize: '1rem',
                  background: 'linear-gradient(90deg, #2563eb 0%, #7c3aed 100%)',
                  '&:hover': { background: 'linear-gradient(90deg, #1d4ed8 0%, #6d28d9 100%)' },
                }}
              >
                {loading ? 'Analyzing Resume...' : 'Analyze My Resume'}
              </Button>

              {loading && (
                <Box mt={2}>
                  <LinearProgress sx={{ borderRadius: 2 }} />
                  <Typography variant="caption" color="text.secondary" display="block" textAlign="center" mt={1}>
                    Extracting text → Profiling resume &amp; JD → Synthesizing ATS analysis...
                  </Typography>
                </Box>
              )}
            </Box>
          </Paper>
        )}

        {mode === 'paste' && (
          <Paper elevation={0} sx={{ border: '1px solid', borderColor: '#e2e8f0', borderRadius: 3, overflow: 'hidden' }}>
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" mb={0.5}>Paste Your LaTeX Resume</Typography>
              <Typography variant="body2" color="text.secondary" mb={2}>
                Paste a full LaTeX document or just the <code style={{ background: '#f1f5f9', padding: '1px 4px', borderRadius: 3 }}>\begin&#123;document&#125;...\end&#123;document&#125;</code> body.
              </Typography>
              <TextField
                fullWidth multiline rows={14}
                placeholder={'\\begin{document}\n\n% paste your resume LaTeX here\n\n\\end{document}'}
                value={pastedLatex}
                onChange={(e) => setPastedLatex(e.target.value)}
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: '#f8fafc', fontSize: '0.82rem', fontFamily: 'monospace',
                    '&:hover fieldset': { borderColor: 'primary.main' },
                  },
                }}
              />
              <Typography variant="caption" color="text.disabled" mt={0.5} display="block">
                {pastedLatex.length} characters
              </Typography>
            </Box>
            <Box sx={{ px: 3, pb: 3 }}>
              <Button
                variant="contained" fullWidth size="large"
                onClick={() => onPasteLatex(pastedLatex)}
                disabled={!pastedLatex.trim()}
                endIcon={<ArrowIcon />}
                sx={{
                  py: 1.5, fontSize: '1rem',
                  background: 'linear-gradient(90deg, #2563eb 0%, #7c3aed 100%)',
                  '&:hover': { background: 'linear-gradient(90deg, #1d4ed8 0%, #6d28d9 100%)' },
                }}
              >
                Open in Editor
              </Button>
            </Box>
          </Paper>
        )}

      </Box>
    </Box>
  );
}
