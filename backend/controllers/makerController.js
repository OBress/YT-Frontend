import { client } from '../config/database.js';
import { exec } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Store active jobs and their progress
const activeJobs = new Map();

// Add this helper function at the top with other constants
function getUserActiveJob(userId) {
  for (const [jobId, status] of activeJobs.entries()) {
    // Split the jobId to get the userId part
    const jobUserId = jobId.split('-')[0];
    // Only match exact userId and active jobs
    if (jobUserId === userId && status.status !== 'completed' && status.status !== 'error') {
      return { jobId, status };
    }
  }
  return null;
}

// Add timeout for job cleanup
const JOB_TIMEOUT = 1000 * 60 * 30; // 30 minutes

export async function createVideos(req, res) {
  try {
    const { userId, channelNames, videoCount } = req.body;
    if (!userId || !Array.isArray(channelNames) || !videoCount) {
      return res.status(400).json({ error: 'Invalid request parameters' });
    }

    // Check for existing active job
    const existingJob = getUserActiveJob(userId);
    if (existingJob) {
      return res.status(409).json({ 
        error: 'Active job already exists',
        jobId: existingJob.jobId,
        status: existingJob.status
      });
    }

    const jobId = `${userId}-${Date.now()}`;
    activeJobs.set(jobId, { progress: 0, status: 'starting' });

    // Immediately respond with the jobId
    res.json({
      message: `Job started successfully. Job ID: ${jobId}`,
      jobId,
      status: 'started'
    });

    // Run the Python script asynchronously
    const pythonScriptPath = path.join(`C:/Users/owen/Desktop/Projects/Web/Youtube-Dashboard/dbUtils/test.py`);
    
    if (!fs.existsSync(pythonScriptPath)) {
      activeJobs.set(jobId, { progress: 0, status: 'error', error: 'Python script not found' });
      return;
    }

    const pythonCommand = process.platform === 'win32' ? 'python' : 'python3';
    
    const pythonProcess = exec(
      `${pythonCommand} "${pythonScriptPath}" "${jobId}"`,  // Add jobId as argument
      (error, stdout, stderr) => {
        if (error) {
          console.error(`Error executing Python script: ${error}`);
          activeJobs.set(jobId, { progress: 0, status: 'error', error: error.message });
          return;
        }
        activeJobs.set(jobId, { progress: 100, status: 'completed' });
      }
    );

    // Listen for progress updates from Python script via stdout
    pythonProcess.stdout.on('data', (data) => {
      try {
        const progressData = JSON.parse(data);
        if (progressData.progress !== undefined) {
          activeJobs.set(jobId, { 
            progress: progressData.progress,
            status: 'running',
            message: progressData.message || ''
          });
        }
      } catch (e) {
        // Handle non-JSON output
        console.log('Python output:', data);
      }
    });

    // Add timeout to clean up completed/failed jobs
    setTimeout(() => {
      if (activeJobs.has(jobId)) {
        const status = activeJobs.get(jobId);
        if (status.status === 'completed' || status.status === 'error') {
          activeJobs.delete(jobId);
        }
      }
    }, JOB_TIMEOUT);

  } catch (error) {
    console.error('Error in createVideos:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message
    });
  }
}

export async function getJobStatus(req, res) {
  const { jobId } = req.params;
  const jobStatus = activeJobs.get(jobId);
  
  if (!jobStatus) {
    return res.status(404).json({ 
      error: 'Job not found',
      status: 'error',
      progress: 0 
    });
  }
  
  res.json(jobStatus);
}
