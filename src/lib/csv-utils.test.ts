import { parseStudentCSV } from './csv-utils';

describe('parseStudentCSV', () => {
  it('should parse a simple CSV with one student per line', () => {
    const csv = 'Alice\nBob\nCharlie';
    expect(parseStudentCSV(csv)).toEqual(['Alice', 'Bob', 'Charlie']);
  });

  it('should handle trailing newlines', () => {
    const csv = 'Alice\nBob\nCharlie\n';
    expect(parseStudentCSV(csv)).toEqual(['Alice', 'Bob', 'Charlie']);
  });

  it('should handle CSV with extra columns, only taking the first', () => {
    const csv = 'Alice,123\nBob,456\nCharlie,789';
    expect(parseStudentCSV(csv)).toEqual(['Alice', 'Bob', 'Charlie']);
  });

  it('should trim whitespace from student names', () => {
    const csv = '  Alice  \n Bob \nCharlie';
    expect(parseStudentCSV(csv)).toEqual(['Alice', 'Bob', 'Charlie']);
  });

  it('should filter out empty lines', () => {
    const csv = 'Alice\n\nBob\nCharlie';
    expect(parseStudentCSV(csv)).toEqual(['Alice', 'Bob', 'Charlie']);
  });

  it('should filter out a header row with the name "student"', () => {
    const csv = 'Student\nAlice\nBob\nCharlie';
    expect(parseStudentCSV(csv)).toEqual(['Alice', 'Bob', 'Charlie']);
  });

  it('should be case-insensitive when filtering the header', () => {
    const csv = 'student\nAlice\nBob\nCharlie';
    expect(parseStudentCSV(csv)).toEqual(['Alice', 'Bob', 'Charlie']);
  });

  it('should return an empty array for an empty string', () => {
    const csv = '';
    expect(parseStudentCSV(csv)).toEqual([]);
  });
});
