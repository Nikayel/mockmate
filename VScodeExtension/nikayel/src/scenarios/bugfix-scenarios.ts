/**
 * Preloaded Bug Fix scenarios
 * Company-specific bugs and common errors
 */

import { BugFixScenario } from './types';

export const bugFixScenarios: BugFixScenario[] = [
  {
    id: 'bug-async-race-condition',
    title: 'Async Race Condition in User Data Fetch',
    type: 'bugfix',
    difficulty: 'medium',
    companies: ['Google', 'Meta', 'Netflix'],
    description: 'Fix race condition when fetching user data asynchronously',
    tags: ['async', 'race-condition', 'javascript', 'react'],
    estimatedTime: 20,
    language: 'typescript',
    buggyCode: `import { useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
}

export function UserProfile({ userId }: { userId: string }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchUser() {
      setLoading(true);
      const response = await fetch(\`/api/users/\${userId}\`);
      const data = await response.json();
      setUser(data);
      setLoading(false);
    }

    fetchUser();
  }, [userId]);

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>No user found</div>;

  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  );
}`,
    bugDescription:
      'When the userId prop changes rapidly (e.g., user clicking through a list), multiple API calls are made. The responses may arrive out of order, causing the wrong user data to be displayed.',
    expectedBehavior:
      'Only the most recent user data should be displayed, and stale requests should be cancelled or ignored.',
    testCases: [
      {
        input: 'Rapidly switch userId from "user1" to "user2" to "user3"',
        expectedOutput: 'Display only user3 data',
        actualOutput: 'May display user1 or user2 data if their responses arrive last',
      },
    ],
    hints: [
      'Consider using a cleanup function in useEffect',
      'Use a flag to track if the component is still mounted with the same userId',
      'AbortController can be used to cancel fetch requests',
      'The cleanup function runs before the effect runs again and when component unmounts',
    ],
  },
  {
    id: 'bug-memory-leak-event-listener',
    title: 'Memory Leak from Event Listeners',
    type: 'bugfix',
    difficulty: 'easy',
    companies: ['Google', 'Amazon', 'Meta', 'Microsoft'],
    description: 'Fix memory leak caused by event listeners not being removed',
    tags: ['memory-leak', 'event-listeners', 'javascript'],
    estimatedTime: 15,
    language: 'typescript',
    buggyCode: `export class DataPoller {
  private apiUrl: string;
  private intervalId: number | null = null;

  constructor(apiUrl: string) {
    this.apiUrl = apiUrl;
  }

  startPolling(callback: (data: any) => void) {
    this.intervalId = window.setInterval(async () => {
      const response = await fetch(this.apiUrl);
      const data = await response.json();
      callback(data);
    }, 5000);

    window.addEventListener('online', () => {
      console.log('Connection restored');
      this.startPolling(callback);
    });

    window.addEventListener('offline', () => {
      console.log('Connection lost');
      this.stopPolling();
    });
  }

  stopPolling() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}`,
    bugDescription:
      'Event listeners for online/offline events are added every time startPolling is called, but never removed. This creates a memory leak and causes callbacks to fire multiple times.',
    expectedBehavior:
      'Event listeners should be properly cleaned up when polling stops or when the class instance is destroyed.',
    testCases: [
      {
        input: 'Call startPolling() multiple times',
        expectedOutput: 'Only one set of event listeners should be active',
        actualOutput: 'Multiple event listeners accumulate, causing callbacks to fire multiple times',
      },
    ],
    hints: [
      'Store references to the event listener functions so they can be removed later',
      'Use removeEventListener with the same function reference',
      'Consider adding a cleanup/destroy method',
    ],
  },
  {
    id: 'bug-sql-injection',
    title: 'SQL Injection Vulnerability',
    type: 'bugfix',
    difficulty: 'medium',
    companies: ['Amazon', 'Meta', 'Netflix', 'Startup'],
    description: 'Fix SQL injection vulnerability in user search',
    tags: ['security', 'sql-injection', 'node.js', 'database'],
    estimatedTime: 20,
    language: 'typescript',
    buggyCode: `import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function searchUsers(searchTerm: string) {
  const query = \`
    SELECT id, username, email, created_at
    FROM users
    WHERE username LIKE '%\${searchTerm}%'
       OR email LIKE '%\${searchTerm}%'
    ORDER BY created_at DESC
    LIMIT 50
  \`;

  const result = await pool.query(query);
  return result.rows;
}

export async function getUserById(userId: string) {
  const query = \`SELECT * FROM users WHERE id = \${userId}\`;
  const result = await pool.query(query);
  return result.rows[0];
}`,
    bugDescription:
      'User input is directly interpolated into SQL queries, allowing SQL injection attacks. An attacker could execute arbitrary SQL commands.',
    expectedBehavior:
      'User input should be properly sanitized using parameterized queries to prevent SQL injection.',
    testCases: [
      {
        input: "searchTerm = \"'; DROP TABLE users; --\"",
        expectedOutput: 'Query should safely search for that literal string',
        actualOutput: 'Could potentially drop the users table',
      },
      {
        input: "userId = \"1 OR 1=1\"",
        expectedOutput: 'Should return user with id 1 or no results',
        actualOutput: 'Returns all users in the database',
      },
    ],
    hints: [
      'Use parameterized queries with $1, $2, etc. placeholders',
      'Pass user input as the second argument to pool.query()',
      'Never use string interpolation or concatenation for SQL queries',
    ],
  },
  {
    id: 'bug-off-by-one-pagination',
    title: 'Off-by-One Error in Pagination',
    type: 'bugfix',
    difficulty: 'easy',
    companies: ['Amazon', 'Google', 'Startup'],
    description: 'Fix off-by-one error causing incorrect pagination',
    tags: ['logic-error', 'pagination', 'arrays'],
    estimatedTime: 15,
    language: 'typescript',
    buggyCode: `interface PaginationResult<T> {
  items: T[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export function paginate<T>(
  items: T[],
  page: number,
  pageSize: number
): PaginationResult<T> {
  const totalItems = items.length;
  const totalPages = Math.ceil(totalItems / pageSize);

  const startIndex = page * pageSize;
  const endIndex = startIndex + pageSize;

  const paginatedItems = items.slice(startIndex, endIndex);

  return {
    items: paginatedItems,
    currentPage: page,
    totalPages,
    totalItems,
    hasNext: page < totalPages,
    hasPrevious: page > 0,
  };
}`,
    bugDescription:
      'The pagination logic has an off-by-one error. When page=1, it skips the first page of items. The function treats page as 0-indexed but users expect 1-indexed pages.',
    expectedBehavior:
      'When page=1, return the first pageSize items. When page=2, return the next pageSize items, etc.',
    testCases: [
      {
        input: 'items=[1,2,3,4,5,6,7,8,9,10], page=1, pageSize=3',
        expectedOutput: 'items=[1,2,3]',
        actualOutput: 'items=[4,5,6]',
      },
      {
        input: 'items=[1,2,3,4,5], page=2, pageSize=2',
        expectedOutput: 'items=[3,4]',
        actualOutput: 'items=[5]',
      },
    ],
    hints: [
      'Decide if pages should be 0-indexed or 1-indexed',
      'Adjust the startIndex calculation accordingly',
      'Also check the hasNext and hasPrevious logic',
    ],
  },
  {
    id: 'bug-null-pointer-java',
    title: 'NullPointerException in User Service',
    type: 'bugfix',
    difficulty: 'easy',
    companies: ['Amazon', 'Google', 'Microsoft'],
    description: 'Fix NullPointerException when optional user data is missing',
    tags: ['null-safety', 'java', 'error-handling'],
    estimatedTime: 15,
    language: 'java',
    buggyCode: `public class UserService {
    private UserRepository userRepository;
    private EmailService emailService;

    public UserService(UserRepository userRepository, EmailService emailService) {
        this.userRepository = userRepository;
        this.emailService = emailService;
    }

    public void sendWelcomeEmail(Long userId) {
        User user = userRepository.findById(userId);
        String email = user.getEmail();
        String name = user.getProfile().getFirstName();

        String message = String.format(
            "Welcome %s! Thanks for joining our platform.",
            name
        );

        emailService.send(email, "Welcome!", message);
    }

    public int getTotalUserPoints(Long userId) {
        User user = userRepository.findById(userId);
        return user.getPoints() + user.getBonusPoints();
    }
}`,
    bugDescription:
      'The code assumes findById() always returns a non-null User, and that profile and other nested objects are always present. This causes NullPointerException when users are not found or have incomplete data.',
    expectedBehavior:
      'Properly handle cases where user is not found or has missing optional data. Use Optional<User> or null checks.',
    testCases: [
      {
        input: 'userId=999 (non-existent user)',
        expectedOutput: 'Should handle gracefully, maybe throw UserNotFoundException',
        actualOutput: 'NullPointerException at user.getEmail()',
      },
      {
        input: 'userId=1 (user exists but profile is null)',
        expectedOutput: 'Should handle missing profile gracefully',
        actualOutput: 'NullPointerException at user.getProfile().getFirstName()',
      },
    ],
    hints: [
      'Change findById to return Optional<User>',
      'Use Optional methods like map(), orElse(), orElseThrow()',
      'Add null checks or use Objects.requireNonNull()',
    ],
  },
  {
    id: 'bug-concurrent-modification',
    title: 'ConcurrentModificationException in List Processing',
    type: 'bugfix',
    difficulty: 'medium',
    companies: ['Google', 'Meta', 'Amazon'],
    description: 'Fix concurrent modification exception when removing items from list during iteration',
    tags: ['collections', 'iteration', 'java', 'concurrency'],
    estimatedTime: 20,
    language: 'java',
    buggyCode: `import java.util.*;

public class TaskProcessor {
    private List<Task> tasks;

    public TaskProcessor(List<Task> tasks) {
        this.tasks = tasks;
    }

    public void processAndRemoveCompleted() {
        for (Task task : tasks) {
            task.process();

            if (task.isCompleted()) {
                tasks.remove(task);
            }
        }
    }

    public void removeExpiredTasks() {
        for (int i = 0; i < tasks.size(); i++) {
            Task task = tasks.get(i);

            if (task.isExpired()) {
                tasks.remove(i);
            }
        }
    }

    public List<Task> getActiveTasks() {
        return tasks;
    }
}

class Task {
    private boolean completed;
    private long expiryTime;

    public void process() {
        // Processing logic
        this.completed = true;
    }

    public boolean isCompleted() {
        return completed;
    }

    public boolean isExpired() {
        return System.currentTimeMillis() > expiryTime;
    }
}`,
    bugDescription:
      'Modifying a list while iterating over it with a for-each loop causes ConcurrentModificationException. The second method has an off-by-one error when removing from a list during forward iteration.',
    expectedBehavior:
      'Should safely remove items from the list without throwing exceptions or skipping elements.',
    testCases: [
      {
        input: 'List with multiple completed tasks',
        expectedOutput: 'All completed tasks removed without exception',
        actualOutput: 'ConcurrentModificationException thrown',
      },
      {
        input: 'List with consecutive expired tasks',
        expectedOutput: 'All expired tasks removed',
        actualOutput: 'Some expired tasks are skipped due to index shifting',
      },
    ],
    hints: [
      'Use an Iterator and its remove() method instead of collection.remove()',
      'Or iterate backwards when using index-based removal',
      'Or use removeIf() method (Java 8+)',
      'Consider using Collections.copy or creating a new list',
    ],
  },
  {
    id: 'bug-react-stale-closure',
    title: 'Stale Closure in React Hooks',
    type: 'bugfix',
    difficulty: 'medium',
    companies: ['Meta', 'Netflix', 'Startup'],
    description: 'Fix stale closure causing incorrect state values in callbacks',
    tags: ['react', 'hooks', 'closure', 'javascript'],
    estimatedTime: 20,
    language: 'typescript',
    buggyCode: `import { useState, useEffect } from 'react';

export function Counter() {
  const [count, setCount] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (isRunning) {
      const interval = setInterval(() => {
        setCount(count + 1);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isRunning]);

  return (
    <div>
      <h1>Count: {count}</h1>
      <button onClick={() => setIsRunning(!isRunning)}>
        {isRunning ? 'Stop' : 'Start'}
      </button>
      <button onClick={() => setCount(0)}>Reset</button>
    </div>
  );
}`,
    bugDescription:
      'The interval callback captures the initial value of count (0) and never updates. The counter increments to 1 and then stops incrementing because it always does 0 + 1.',
    expectedBehavior: 'Counter should increment by 1 every second when running.',
    testCases: [
      {
        input: 'Click Start button',
        expectedOutput: 'Count increases: 1, 2, 3, 4, ...',
        actualOutput: 'Count increases to 1 and stops',
      },
    ],
    hints: [
      'Use the functional update form of setState: setCount(prev => prev + 1)',
      'Or add count to the dependency array (but be careful with the interval)',
      'The functional form gives you access to the latest state value',
    ],
  },
  {
    id: 'bug-python-mutable-default',
    title: 'Mutable Default Argument in Python',
    type: 'bugfix',
    difficulty: 'easy',
    companies: ['Google', 'Startup', 'Amazon'],
    description: 'Fix bug caused by mutable default argument',
    tags: ['python', 'default-arguments', 'mutable'],
    estimatedTime: 15,
    language: 'python',
    buggyCode: `class UserManager:
    def __init__(self):
        self.users = {}

    def add_user(self, username, roles=[]):
        """Add a user with specified roles"""
        roles.append('user')  # Everyone gets 'user' role
        self.users[username] = {
            'username': username,
            'roles': roles,
            'created_at': datetime.now()
        }
        return self.users[username]

    def create_admin(self, username):
        """Create an admin user"""
        return self.add_user(username, ['admin'])

    def create_regular_user(self, username):
        """Create a regular user with no extra roles"""
        return self.add_user(username)`,
    bugDescription:
      'Using a mutable default argument (empty list) causes all users created without explicit roles to share the same list object. This means roles accumulate across multiple user creations.',
    expectedBehavior:
      'Each user should have their own independent list of roles.',
    testCases: [
      {
        input: `
manager = UserManager()
user1 = manager.create_regular_user('alice')
user2 = manager.create_regular_user('bob')
print(user1['roles'])
print(user2['roles'])`,
        expectedOutput: `
['user']
['user']`,
        actualOutput: `
['user']
['user', 'user']`,
      },
    ],
    hints: [
      'Never use mutable objects (list, dict) as default arguments',
      'Use None as default and create a new list inside the function',
      'Pattern: def add_user(self, username, roles=None): roles = roles if roles is not None else []',
    ],
  },
];
