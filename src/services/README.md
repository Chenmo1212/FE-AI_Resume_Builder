# IndexedDB Storage and Task Tracking System

This implementation provides a solution for storing resume data in IndexedDB and tracking long-running AI tasks for resume modifications.

## Architecture Overview

The system consists of the following components:

1. **IndexedDB Database Service**: Provides a generic interface for storing and retrieving data from IndexedDB.
2. **Task Tracking Service**: Manages AI resume modification tasks, including creation, status updates, and polling.
3. **AI Service**: Connects the client-side task tracking with serverless functions for AI processing.
4. **Zustand Store for Tasks**: Provides a React-friendly way to access and manage tasks.
5. **Example UI Component**: Demonstrates how to use the system in a React component.

## Files and Their Purposes

- `src/services/db.service.js`: Generic IndexedDB service for data storage
- `src/services/task.service.js`: Task tracking service for managing AI tasks
- `src/services/ai.service.js`: Service for connecting with serverless functions
- `src/stores/tasks.store.js`: Zustand store for managing task state in React
- `src/core/components/ai/AIResumeImprover.jsx`: Example React component
- `src/serverless/ai-resume-processor.js`: Example serverless functions

## How to Use

### 1. Initialize the Database

The database is automatically initialized when the `dbService` is imported. It creates the necessary object stores for resumes, jobs, and tasks.

```javascript
import { dbService, STORES } from '../services/db.service';

// Now you can use dbService to interact with IndexedDB
```

### 2. Store Resume and Job Data

Use the database service to store resume and job data:

```javascript
// Store a resume
const resumeId = await dbService.add(STORES.RESUMES, resumeData);

// Store a job
const jobId = await dbService.add(STORES.JOBS, jobData);

// Retrieve a resume
const resume = await dbService.getById(STORES.RESUMES, resumeId);
```

### 3. Create and Track AI Tasks

Use the task service to create and manage AI tasks:

```javascript
import { taskService, TASK_STATUS } from '../services/task.service';

// Create a task
const task = await taskService.createTask({
  jobId: 'job-123',
  resumeId: 'resume-456',
  type: 'ai_improvement',
  input: { resumeData, jobData },
  requiresPolling: true
});

// Update task progress
await taskService.updateTaskProgress(task.id, 50);

// Complete a task
await taskService.completeTask(task.id, { suggestions: { ... } });

// Handle a failed task
await taskService.failTask(task.id, 'Error message');
```

### 4. Use the Zustand Store in React Components

Use the tasks store in React components:

```javascript
import { useTasks } from '../stores/tasks.store';

function MyComponent() {
  const { tasks, loading, error, createAIResumeTask } = useTasks();
  
  // Use the store methods and state
}
```

### 5. Integrate with Serverless Functions

Use the AI service to connect with serverless functions:

```javascript
import { aiService } from '../services/ai.service';

// Submit a resume for AI improvement
const taskId = await aiService.improveResume(resumeData, jobData);

// Check task status
const status = await aiService.checkTaskStatus(taskId);

// Apply AI suggestions to a resume
const updatedResume = await aiService.applySuggestions(taskId, resumeData);
```

## Implementation Details

### IndexedDB Schema

The IndexedDB database has three object stores:

1. **resumes**: Stores resume data
   - Key: `id`
   - Indexes: `updatedAt`

2. **jobs**: Stores job data
   - Key: `id`
   - Indexes: `updatedAt`

3. **tasks**: Stores task data
   - Key: `id`
   - Indexes: `status`, `jobId`, `createdAt`, `updatedAt`

### Task Status Flow

Tasks follow this status flow:

1. **PENDING**: Task is created but not yet started
2. **PROCESSING**: Task is being processed
3. **COMPLETED**: Task is successfully completed
4. **FAILED**: Task failed to complete

### Polling Mechanism

For long-running tasks, the system uses a polling mechanism:

1. Create a task in the local database
2. Submit the task to a serverless function
3. Start polling for status updates
4. Update the local task status based on the serverless function response
5. Stop polling when the task is completed or failed

## Best Practices

1. **Error Handling**: Always handle errors in async operations
2. **Task Cleanup**: Implement a cleanup mechanism for old tasks
3. **Offline Support**: Handle offline scenarios gracefully
4. **Progress Updates**: Provide regular progress updates for long-running tasks
5. **User Feedback**: Keep users informed about task status