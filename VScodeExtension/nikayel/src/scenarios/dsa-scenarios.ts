/**
 * Preloaded DSA (Data Structures & Algorithms) scenarios
 * Common problems asked in technical interviews
 */

import { DSAScenario } from './types';

export const dsaScenarios: DSAScenario[] = [
  {
    id: 'dsa-two-sum',
    title: 'Two Sum',
    type: 'dsa',
    difficulty: 'easy',
    companies: ['Google', 'Amazon', 'Meta', 'Microsoft', 'Apple'],
    description: 'Find two numbers in an array that add up to a target value',
    tags: ['array', 'hash-table', 'two-pointers'],
    estimatedTime: 15,
    problemStatement: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.`,
    examples: [
      {
        input: 'nums = [2,7,11,15], target = 9',
        output: '[0,1]',
        explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].',
      },
      {
        input: 'nums = [3,2,4], target = 6',
        output: '[1,2]',
      },
      {
        input: 'nums = [3,3], target = 6',
        output: '[0,1]',
      },
    ],
    constraints: [
      '2 <= nums.length <= 10^4',
      '-10^9 <= nums[i] <= 10^9',
      '-10^9 <= target <= 10^9',
      'Only one valid answer exists.',
    ],
    hints: [
      'Try using a hash map to store values you\'ve already seen',
      'For each number, check if (target - current number) exists in your hash map',
      'The optimal solution has O(n) time complexity',
    ],
    starterCode: {
      typescript: `function twoSum(nums: number[], target: number): number[] {
    // Your code here
}`,
      javascript: `function twoSum(nums, target) {
    // Your code here
}`,
      python: `def twoSum(nums, target):
    # Your code here
    pass`,
      java: `public int[] twoSum(int[] nums, int target) {
    // Your code here
}`,
    },
    optimalComplexity: {
      time: 'O(n)',
      space: 'O(n)',
    },
  },
  {
    id: 'dsa-three-sum',
    title: 'Three Sum',
    type: 'dsa',
    difficulty: 'medium',
    companies: ['Google', 'Amazon', 'Meta', 'Microsoft', 'Apple'],
    description: 'Find all unique triplets in an array that sum to zero',
    tags: ['array', 'two-pointers', 'sorting'],
    estimatedTime: 30,
    problemStatement: `Given an integer array nums, return all the triplets [nums[i], nums[j], nums[k]] such that i != j, i != k, and j != k, and nums[i] + nums[j] + nums[k] == 0.

Notice that the solution set must not contain duplicate triplets.`,
    examples: [
      {
        input: 'nums = [-1,0,1,2,-1,-4]',
        output: '[[-1,-1,2],[-1,0,1]]',
        explanation:
          'nums[0] + nums[1] + nums[2] = (-1) + 0 + 1 = 0.\nnums[1] + nums[2] + nums[4] = 0 + 1 + (-1) = 0.\nnums[0] + nums[3] + nums[4] = (-1) + 2 + (-1) = 0.\nThe distinct triplets are [-1,0,1] and [-1,-1,2].',
      },
      {
        input: 'nums = [0,1,1]',
        output: '[]',
        explanation: 'The only possible triplet does not sum up to 0.',
      },
      {
        input: 'nums = [0,0,0]',
        output: '[[0,0,0]]',
      },
    ],
    constraints: [
      '3 <= nums.length <= 3000',
      '-10^5 <= nums[i] <= 10^5',
    ],
    hints: [
      'Sort the array first to make it easier to avoid duplicates',
      'Fix one number and use two pointers for the remaining two numbers',
      'Skip duplicate values to avoid duplicate triplets',
      'The optimal solution has O(n²) time complexity',
    ],
    starterCode: {
      typescript: `function threeSum(nums: number[]): number[][] {
    // Your code here
}`,
      javascript: `function threeSum(nums) {
    // Your code here
}`,
      python: `def threeSum(nums):
    # Your code here
    pass`,
      java: `public List<List<Integer>> threeSum(int[] nums) {
    // Your code here
}`,
    },
    optimalComplexity: {
      time: 'O(n²)',
      space: 'O(1) or O(n) depending on sorting algorithm',
    },
  },
  {
    id: 'dsa-valid-parentheses',
    title: 'Valid Parentheses',
    type: 'dsa',
    difficulty: 'easy',
    companies: ['Google', 'Amazon', 'Meta', 'Microsoft', 'Netflix'],
    description: 'Determine if a string of brackets is valid',
    tags: ['string', 'stack'],
    estimatedTime: 15,
    problemStatement: `Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.`,
    examples: [
      {
        input: 's = "()"',
        output: 'true',
      },
      {
        input: 's = "()[]{}"',
        output: 'true',
      },
      {
        input: 's = "(]"',
        output: 'false',
      },
      {
        input: 's = "([)]"',
        output: 'false',
      },
    ],
    constraints: ['1 <= s.length <= 10^4', 's consists of parentheses only \'()[]{}\''],
    hints: [
      'Think about using a stack data structure',
      'Push opening brackets onto the stack',
      'When you encounter a closing bracket, check if it matches the top of the stack',
    ],
    starterCode: {
      typescript: `function isValid(s: string): boolean {
    // Your code here
}`,
      javascript: `function isValid(s) {
    // Your code here
}`,
      python: `def isValid(s):
    # Your code here
    pass`,
      java: `public boolean isValid(String s) {
    // Your code here
}`,
    },
    optimalComplexity: {
      time: 'O(n)',
      space: 'O(n)',
    },
  },
  {
    id: 'dsa-reverse-linked-list',
    title: 'Reverse Linked List',
    type: 'dsa',
    difficulty: 'easy',
    companies: ['Google', 'Amazon', 'Meta', 'Microsoft', 'Apple', 'Netflix'],
    description: 'Reverse a singly linked list',
    tags: ['linked-list', 'recursion', 'iteration'],
    estimatedTime: 20,
    problemStatement: `Given the head of a singly linked list, reverse the list, and return the reversed list.`,
    examples: [
      {
        input: 'head = [1,2,3,4,5]',
        output: '[5,4,3,2,1]',
      },
      {
        input: 'head = [1,2]',
        output: '[2,1]',
      },
      {
        input: 'head = []',
        output: '[]',
      },
    ],
    constraints: [
      'The number of nodes in the list is the range [0, 5000]',
      '-5000 <= Node.val <= 5000',
    ],
    hints: [
      'You can solve this iteratively using three pointers: prev, current, and next',
      'Or solve it recursively by reversing the rest of the list first',
      'Make sure to handle the edge case of an empty list',
    ],
    starterCode: {
      typescript: `class ListNode {
    val: number;
    next: ListNode | null;
    constructor(val?: number, next?: ListNode | null) {
        this.val = (val===undefined ? 0 : val);
        this.next = (next===undefined ? null : next);
    }
}

function reverseList(head: ListNode | null): ListNode | null {
    // Your code here
}`,
      javascript: `function reverseList(head) {
    // Your code here
}`,
      python: `class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def reverseList(head):
    # Your code here
    pass`,
      java: `public ListNode reverseList(ListNode head) {
    // Your code here
}`,
    },
    optimalComplexity: {
      time: 'O(n)',
      space: 'O(1) iterative, O(n) recursive',
    },
  },
  {
    id: 'dsa-binary-search',
    title: 'Binary Search',
    type: 'dsa',
    difficulty: 'easy',
    companies: ['Google', 'Amazon', 'Meta', 'Microsoft', 'Apple'],
    description: 'Search for a target value in a sorted array',
    tags: ['array', 'binary-search'],
    estimatedTime: 15,
    problemStatement: `Given an array of integers nums which is sorted in ascending order, and an integer target, write a function to search target in nums. If target exists, then return its index. Otherwise, return -1.

You must write an algorithm with O(log n) runtime complexity.`,
    examples: [
      {
        input: 'nums = [-1,0,3,5,9,12], target = 9',
        output: '4',
        explanation: '9 exists in nums and its index is 4',
      },
      {
        input: 'nums = [-1,0,3,5,9,12], target = 2',
        output: '-1',
        explanation: '2 does not exist in nums so return -1',
      },
    ],
    constraints: [
      '1 <= nums.length <= 10^4',
      '-10^4 < nums[i], target < 10^4',
      'All the integers in nums are unique',
      'nums is sorted in ascending order',
    ],
    hints: [
      'Use two pointers (left and right) to track the search range',
      'In each iteration, compare the middle element with the target',
      'Adjust the search range based on the comparison',
    ],
    starterCode: {
      typescript: `function search(nums: number[], target: number): number {
    // Your code here
}`,
      javascript: `function search(nums, target) {
    // Your code here
}`,
      python: `def search(nums, target):
    # Your code here
    pass`,
      java: `public int search(int[] nums, int target) {
    // Your code here
}`,
    },
    optimalComplexity: {
      time: 'O(log n)',
      space: 'O(1)',
    },
  },
  {
    id: 'dsa-maximum-subarray',
    title: 'Maximum Subarray (Kadane\'s Algorithm)',
    type: 'dsa',
    difficulty: 'medium',
    companies: ['Google', 'Amazon', 'Meta', 'Microsoft', 'Apple'],
    description: 'Find the contiguous subarray with the largest sum',
    tags: ['array', 'dynamic-programming', 'divide-and-conquer'],
    estimatedTime: 25,
    problemStatement: `Given an integer array nums, find the contiguous subarray (containing at least one number) which has the largest sum and return its sum.

A subarray is a contiguous part of an array.`,
    examples: [
      {
        input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]',
        output: '6',
        explanation: 'The subarray [4,-1,2,1] has the largest sum 6.',
      },
      {
        input: 'nums = [1]',
        output: '1',
      },
      {
        input: 'nums = [5,4,-1,7,8]',
        output: '23',
      },
    ],
    constraints: ['1 <= nums.length <= 10^5', '-10^4 <= nums[i] <= 10^4'],
    hints: [
      'This is a classic dynamic programming problem',
      'For each position, decide: should you extend the previous subarray or start a new one?',
      'Keep track of the maximum sum seen so far',
      'This is known as Kadane\'s Algorithm',
    ],
    starterCode: {
      typescript: `function maxSubArray(nums: number[]): number {
    // Your code here
}`,
      javascript: `function maxSubArray(nums) {
    // Your code here
}`,
      python: `def maxSubArray(nums):
    # Your code here
    pass`,
      java: `public int maxSubArray(int[] nums) {
    // Your code here
}`,
    },
    optimalComplexity: {
      time: 'O(n)',
      space: 'O(1)',
    },
  },
  {
    id: 'dsa-climbing-stairs',
    title: 'Climbing Stairs',
    type: 'dsa',
    difficulty: 'easy',
    companies: ['Google', 'Amazon', 'Meta', 'Apple'],
    description: 'Count distinct ways to climb stairs',
    tags: ['dynamic-programming', 'memoization', 'fibonacci'],
    estimatedTime: 15,
    problemStatement: `You are climbing a staircase. It takes n steps to reach the top.

Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?`,
    examples: [
      {
        input: 'n = 2',
        output: '2',
        explanation: 'There are two ways to climb to the top: 1. 1 step + 1 step, 2. 2 steps',
      },
      {
        input: 'n = 3',
        output: '3',
        explanation:
          'There are three ways to climb to the top: 1. 1 step + 1 step + 1 step, 2. 1 step + 2 steps, 3. 2 steps + 1 step',
      },
    ],
    constraints: ['1 <= n <= 45'],
    hints: [
      'Think about the Fibonacci sequence',
      'To reach step n, you could come from step n-1 or step n-2',
      'Use dynamic programming to avoid recalculating the same values',
    ],
    starterCode: {
      typescript: `function climbStairs(n: number): number {
    // Your code here
}`,
      javascript: `function climbStairs(n) {
    // Your code here
}`,
      python: `def climbStairs(n):
    # Your code here
    pass`,
      java: `public int climbStairs(int n) {
    // Your code here
}`,
    },
    optimalComplexity: {
      time: 'O(n)',
      space: 'O(1)',
    },
  },
  {
    id: 'dsa-merge-intervals',
    title: 'Merge Intervals',
    type: 'dsa',
    difficulty: 'medium',
    companies: ['Google', 'Amazon', 'Meta', 'Microsoft', 'Netflix'],
    description: 'Merge overlapping intervals',
    tags: ['array', 'sorting', 'intervals'],
    estimatedTime: 25,
    problemStatement: `Given an array of intervals where intervals[i] = [starti, endi], merge all overlapping intervals, and return an array of the non-overlapping intervals that cover all the intervals in the input.`,
    examples: [
      {
        input: 'intervals = [[1,3],[2,6],[8,10],[15,18]]',
        output: '[[1,6],[8,10],[15,18]]',
        explanation: 'Since intervals [1,3] and [2,6] overlap, merge them into [1,6].',
      },
      {
        input: 'intervals = [[1,4],[4,5]]',
        output: '[[1,5]]',
        explanation: 'Intervals [1,4] and [4,5] are considered overlapping.',
      },
    ],
    constraints: [
      '1 <= intervals.length <= 10^4',
      'intervals[i].length == 2',
      '0 <= starti <= endi <= 10^4',
    ],
    hints: [
      'Sort the intervals by their start time first',
      'Iterate through sorted intervals and merge overlapping ones',
      'Two intervals overlap if the start of the second is <= end of the first',
    ],
    starterCode: {
      typescript: `function merge(intervals: number[][]): number[][] {
    // Your code here
}`,
      javascript: `function merge(intervals) {
    // Your code here
}`,
      python: `def merge(intervals):
    # Your code here
    pass`,
      java: `public int[][] merge(int[][] intervals) {
    // Your code here
}`,
    },
    optimalComplexity: {
      time: 'O(n log n)',
      space: 'O(n)',
    },
  },
];
