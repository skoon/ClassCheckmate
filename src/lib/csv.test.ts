import { describe, it, expect } from 'vitest';
import { parseStudentCSV } from './csv';

describe('parseStudentCSV', () => {
  it('returns empty array for empty input', () => {
    expect(parseStudentCSV('')).toEqual([]);
  });

  it('parses simple CSV with header', () => {
    const csv = 'Student,Age\nAlice,10\nBob,11';
    expect(parseStudentCSV(csv)).toEqual(['Alice', 'Bob']);
  });

  it('ignores blank lines and trims names', () => {
    const csv = 'Student\n Alice \n\nBob  \n';
    expect(parseStudentCSV(csv)).toEqual(['Alice', 'Bob']);
  });

  it('handles CRLF newlines', () => {
    const csv = 'Student\r\nCharlie,12\r\nDana,13\r\n';
    expect(parseStudentCSV(csv)).toEqual(['Charlie', 'Dana']);
  });
});
