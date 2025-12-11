// prisma/seed.js
// Run with:  node prisma/seed.js
//
// Populates the Neon Postgres table "Problem" with the 25 Leet-Code rows
// you pasted earlier.  Uses Prisma so you never write raw SQL.

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const problems = [
  {
    title: 'Two Sum',
    description:
      'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice. You can return the answer in any order.',
    difficulty: 'Easy',
    acceptance: 46.7,
    slug: 'two-sum',
    numberOfTestcases: 4,
    companies: [
      'Amazon','Google','Apple','Adobe','Microsoft','Bloomberg','Facebook',
      'Oracle','Uber','Expedia','Twitter','Nagarro','SAP','Yahoo','Cisco',
      'Qualcomm','tcs','Goldman Sachs','Yandex','ServiceNow'
    ],
    relatedTopics: ['Array','Hash Table']
  },
  {
    title: 'Longest Substring Without Repeating Characters',
    description:
      'Given a string s, find the length of the longest substring without repeating characters.',
    difficulty: 'Medium',
    acceptance: 31.5,
    slug: 'longest-substring-without-repeating-characters',
    numberOfTestcases: 4,
    companies: [
      'Amazon','Bloomberg','Microsoft','Facebook','Apple','Adobe','eBay',
      'Goldman Sachs','Google','Alation','VMware','Oracle','ByteDance',
      'Yahoo','Uber','SAP','Salesforce','Coupang','Splunk','Spotify'
    ],
    relatedTopics: ['Hash Table','Two Pointers','String','Sliding Window']
  },
  {
    title: 'Median of Two Sorted Arrays',
    description:
      'Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays. The overall run time complexity should be O(log (m+n)).',
    difficulty: 'Hard',
    acceptance: 31.4,
    slug: 'median-of-two-sorted-arrays',
    numberOfTestcases: 4,
    companies: [
      'Amazon','Goldman Sachs','Facebook','Microsoft','Apple','Adobe',
      'Google','Bloomberg','Zillow','Uber','Flipkart','Paypal'
    ],
    relatedTopics: ['Array','Binary Search','Divide and Conquer']
  },
  {
    title: 'Longest Palindromic Substring',
    description:
      'Given a string s, return the longest palindromic substring in s.',
    difficulty: 'Medium',
    acceptance: 30.6,
    slug: 'longest-palindromic-substring',
    numberOfTestcases: 4,
    companies: [
      'Amazon','Microsoft','Wayfair','Facebook','Adobe','eBay','Google',
      'Oracle','Goldman Sachs','Yandex','Qualcomm'
    ],
    relatedTopics: ['String','Dynamic Programming']
  },
  {
    title: 'Reverse Integer',
    description:
      'Given a signed 32-bit integer x, return x with its digits reversed. If reversing x causes the value to go outside the signed 32-bit integer range [-2^31, 2^31 - 1], then return 0.',
    difficulty: 'Easy',
    acceptance: 25.9,
    slug: 'reverse-integer',
    numberOfTestcases: 4,
    companies: [
      'Amazon','Google','Apple','Facebook','Bloomberg','American Express',
      'Microsoft','Adobe','Uber'
    ],
    relatedTopics: ['Math']
  },
  {
    title: 'String to Integer (atoi)',
    description:
      'Implement the myAtoi(string s) function, which converts a string to a 32-bit signed integer.',
    difficulty: 'Medium',
    acceptance: 15.7,
    slug: 'string-to-integer-atoi',
    numberOfTestcases: 4,
    companies: [
      'Facebook','Amazon','Microsoft','Google','Goldman Sachs','Apple',
      'Adobe','Bloomberg','Intel'
    ],
    relatedTopics: ['Math','String']
  },
  {
    title: 'Palindrome Number',
    description:
      'Given an integer x, return true if x is a palindrome, and false otherwise.',
    difficulty: 'Easy',
    acceptance: 50.0,
    slug: 'palindrome-number',
    numberOfTestcases: 4,
    companies: ['Microsoft','Adobe','Bloomberg','Facebook','Google','Yahoo'],
    relatedTopics: ['Math']
  },
  {
    title: 'Container With Most Water',
    description:
      'You are given an integer array height of length n. There are n vertical lines drawn such that the two endpoints of the ith line are (i, 0) and (i, height[i]). Find two lines that together with the x-axis form a container, such that the container contains the most water.',
    difficulty: 'Medium',
    acceptance: 52.9,
    slug: 'container-with-most-water',
    numberOfTestcases: 4,
    companies: [
      'Amazon','Google','Microsoft','Facebook','Goldman Sachs','Adobe','Apple'
    ],
    relatedTopics: ['Array','Two Pointers']
  },
  {
    title: 'Integer to Roman',
    description:
      'Seven different symbols represent Roman numerals with the following values: I 1, V 5, X 10, L 50, C 100, D 500, M 1000. Convert an integer to a Roman numeral.',
    difficulty: 'Medium',
    acceptance: 57.1,
    slug: 'integer-to-roman',
    numberOfTestcases: 4,
    companies: ['Amazon','Bloomberg','Microsoft','Adobe','Google','Apple','Oracle'],
    relatedTopics: ['Math','String']
  },
  {
    title: 'Roman to Integer',
    description:
      'Roman numerals are represented by seven different symbols: I, V, X, L, C, D and M. Convert a Roman numeral to an integer.',
    difficulty: 'Easy',
    acceptance: 57.0,
    slug: 'roman-to-integer',
    numberOfTestcases: 4,
    companies: [
      'Amazon','Roblox','Microsoft','Adobe','Facebook','LinkedIn','Google',
      'Apple','Uber','Qualtrics','Oracle','eBay'
    ],
    relatedTopics: ['Math','String']
  },
  {
    title: 'Longest Common Prefix',
    description:
      'Write a function to find the longest common prefix string amongst an array of strings.',
    difficulty: 'Easy',
    acceptance: 36.2,
    slug: 'longest-common-prefix',
    numberOfTestcases: 4,
    companies: [
      'Facebook','Adobe','Amazon','Apple','Bloomberg','Microsoft','Yahoo','Google'
    ],
    relatedTopics: ['String']
  },
  {
    title: '3Sum',
    description:
      'Given an integer array nums, return all the triplets [nums[i], nums[j], nums[k]] such that i != j, i != k, and j != k, and nums[i] + nums[j] + nums[k] == 0.',
    difficulty: 'Medium',
    acceptance: 28.3,
    slug: '3sum',
    numberOfTestcases: 4,
    companies: [
      'Amazon','Facebook','Microsoft','Bloomberg','Apple','Adobe','VMware',
      'Google','Cisco','Tesla','Goldman Sachs','eBay'
    ],
    relatedTopics: ['Array','Two Pointers']
  },
  {
    title: '3Sum Closest',
    description:
      'Given an integer array nums of length n and an integer target, find three integers in nums such that the sum is closest to target.',
    difficulty: 'Medium',
    acceptance: 46.3,
    slug: '3sum-closest',
    numberOfTestcases: 4,
    companies: ['Amazon','Apple','Google','Facebook','Bloomberg'],
    relatedTopics: ['Array','Two Pointers']
  },
  {
    title: 'Letter Combinations of a Phone Number',
    description:
      'Given a string containing digits from 2-9 inclusive, return all possible letter combinations that the number could represent.',
    difficulty: 'Medium',
    acceptance: 49.5,
    slug: 'letter-combinations-of-a-phone-number',
    numberOfTestcases: 4,
    companies: [
      'Amazon','Microsoft','Twilio','Facebook','Capital One','eBay','Google',
      'Uber','Apple','Oracle','JPMorgan','Morgan Stanley','Tesla','Qualtrics','Samsung'
    ],
    relatedTopics: ['String','Backtracking','Depth-first Search','Recursion']
  },
  {
    title: '4Sum',
    description:
      'Given an array nums of n integers, return an array of all the unique quadruplets [nums[a], nums[b], nums[c], nums[d]] such that 0 <= a, b, c, d < n, a, b, c, and d are distinct, and nums[a] + nums[b] + nums[c] + nums[d] == target.',
    difficulty: 'Medium',
    acceptance: 35.1,
    slug: '4sum',
    numberOfTestcases: 4,
    companies: ['Amazon','Bloomberg'],
    relatedTopics: ['Array','Hash Table','Two Pointers']
  },
  {
    title: 'Valid Parentheses',
    description:
      "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
    difficulty: 'Easy',
    acceptance: 40.0,
    slug: 'valid-parentheses',
    numberOfTestcases: 4,
    companies: [
      'Amazon','Bloomberg','Facebook','Apple','Microsoft','Expedia','Spotify',
      'Google','LinkedIn','Goldman Sachs','Oracle','IBM','JPMorgan','Intuit',
      'Paypal','Atlassian','eBay','Adobe','ServiceNow','Qualcomm'
    ],
    relatedTopics: ['String','Stack']
  },
  {
    title: 'Generate Parentheses',
    description:
      'Given n pairs of parentheses, write a function to generate all combinations of well-formed parentheses.',
    difficulty: 'Medium',
    acceptance: 65.7,
    slug: 'generate-parentheses',
    numberOfTestcases: 4,
    companies: [
      'Microsoft','Facebook','Google','Bloomberg','Amazon','Apple','Adobe',
      'Walmart Labs','ByteDance','Nvidia','Oracle'
    ],
    relatedTopics: ['String','Backtracking']
  },
  {
    title: 'Remove Duplicates from Sorted Array',
    description:
      'Given an integer array nums and an integer val, remove all occurrences of val in nums in-place. The order of the elements may be changed. Then return the number of elements in nums which are not equal to val.',
    difficulty: 'Easy',
    acceptance: 46.8,
    slug: 'remove-duplicates-from-sorted-array',
    numberOfTestcases: 4,
    companies: ['Google','Facebook','Amazon','Microsoft'],
    relatedTopics: ['Array','Two Pointers']
  },
  {
    title: 'Remove Element',
    description:
      'Given an integer array nums and an integer val, remove all occurrences of val in nums in-place. The order of the elements may be changed. Then return the number of elements in nums which are not equal to val.',
    difficulty: 'Easy',
    acceptance: 49.5,
    slug: 'remove-element',
    numberOfTestcases: 4,
    companies: ['Adobe','Amazon','Oracle'],
    relatedTopics: ['Array','Two Pointers']
  },
  {
    title: 'Implement strStr()',
    description:
      'Given two strings needle and haystack, return the index of the first occurrence of needle in haystack, or -1 if needle is not part of haystack.',
    difficulty: 'Easy',
    acceptance: 35.3,
    slug: 'implement-strstr',
    numberOfTestcases: 4,
    companies: ['Facebook','Apple','Amazon'],
    relatedTopics: ['Two Pointers','String']
  },
  {
    title: 'Divide Two Integers',
    description:
      'Given two integers dividend and divisor, divide two integers without using multiplication, division, and mod operator.',
    difficulty: 'Medium',
    acceptance: 16.9,
    slug: 'divide-two-integers',
    numberOfTestcases: 4,
    companies: ['Facebook','Amazon'],
    relatedTopics: ['Math','Binary Search']
  },
  {
    title: 'Next Permutation',
    description:
      'You are given a string s and an array of strings words. All the strings of words are of the same length. A concatenated string is a string that exactly contains all the strings of any permutation of words concatenated.',
    difficulty: 'Medium',
    acceptance: 33.9,
    slug: 'next-permutation',
    numberOfTestcases: 4,
    companies: [
      'Facebook','Amazon','Google','Microsoft','Rubrik','Bloomberg','Apple',
      'Morgan Stanley','Goldman Sachs','Atlassian','tcs'
    ],
    relatedTopics: ['Array']
  },
  {
    title: 'Longest Valid Parentheses',
    description:
      "Given a string containing just the characters '(' and ')', return the length of the longest valid (well-formed) parentheses substring.",
    difficulty: 'Hard',
    acceptance: 29.9,
    slug: 'longest-valid-parentheses',
    numberOfTestcases: 4,
    companies: ['Amazon','Facebook','Apple','ByteDance'],
    relatedTopics: ['String','Dynamic Programming']
  },
  {
    title: 'Search in Rotated Sorted Array',
    description:
      'There is an integer array nums sorted in ascending order (with distinct values). Prior to being passed to your function, nums is possibly left rotated at an unknown index k.',
    difficulty: 'Medium',
    acceptance: 36.1,
    slug: 'search-in-rotated-sorted-array',
    numberOfTestcases: 4,
    companies: [
      'Amazon','Facebook','Microsoft','LinkedIn','Oracle','Apple','Bloomberg',
      'Nvidia','Expedia','Google','Adobe','Zillow','ByteDance','eBay','Cisco',
      'ServiceNow','C3 IoT'
    ],
    relatedTopics: ['Array','Binary Search']
  },
  {
    title: 'Find First and Last Position of Element in Sorted Array',
    description:
      'Given an array of integers nums sorted in non-decreasing order, find the starting and ending position of a given target value.',
    difficulty: 'Medium',
    acceptance: 37.5,
    slug: 'find-first-and-last-position-of-element-in-sorted-array',
    numberOfTestcases: 4,
    companies: [
      'Facebook','Amazon','Uber','Google','Microsoft','LinkedIn','Bloomberg',
      'Snapchat','Oracle'
    ],
    relatedTopics: ['Array','Binary Search']
  }
];

async function main() {
  for (const p of problems) {
    await prisma.problem.upsert({
      where: { slug: p.slug },
      update: {}, // leave existing rows untouched
      create: p
    });
  }
  console.log(`✅  Seeded ${problems.length} problems`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });