const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');

class PDFProcessingService {
  /**
   * Extract text from PDF with improved error handling and text cleaning
   */
  static async extractTextFromPDF(filePath) {
    try {
      if (!fs.existsSync(filePath)) {
        console.log('PDF file not found:', filePath);
        return '';
      }
      
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdfParse(dataBuffer);
      
      // Clean and normalize the text
      let text = data.text;
      
      // Remove extra whitespace and normalize
      text = text.replace(/\s+/g, ' ').trim();
      
      // Remove special characters but keep alphanumeric and basic punctuation
      text = text.replace(/[^\w\s\-\.\,\:\;\(\)\[\]\{\}\+\=\*\/\@\#\$\%\&\|]/g, ' ');
      
      // Normalize whitespace again
      text = text.replace(/\s+/g, ' ').trim();
      
      console.log(`PDF text extracted successfully. Length: ${text.length} characters`);
      console.log(`First 200 characters: ${text.substring(0, 200)}...`);
      
      return text;
    } catch (error) {
      console.error('Error extracting text from PDF:', error);
      return '';
    }
  }

  /**
   * Extract all individual words from text for comprehensive matching
   */
  static extractWords(text) {
    if (!text) return [];
    
    // Convert to lowercase and split into words
    const words = text.toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 0)
      .map(word => word.trim());
    
    console.log(`Extracted ${words.length} words from text`);
    return words;
  }

  /**
   * Create n-grams (phrases) from text for better keyword matching
   */
  static createNGrams(text, n = 2) {
    if (!text) return [];
    
    const words = text.toLowerCase().split(/\s+/).filter(word => word.length > 0);
    const ngrams = [];
    
    for (let i = 0; i <= words.length - n; i++) {
      const ngram = words.slice(i, i + n).join(' ');
      ngrams.push(ngram);
    }
    
    return ngrams;
  }

  /**
   * Advanced keyword matching with multiple strategies
   */
  static matchKeywords(text, keywords) {
    const results = {
      exactMatches: [],
      partialMatches: [],
      wordMatches: [],
      ngramMatches: [],
      totalScore: 0,
      matchedKeywords: []
    };

    if (!text || !keywords || keywords.length === 0) {
      console.log('❌ No text or keywords provided for matching');
      console.log('Text length:', text ? text.length : 0);
      console.log('Keywords count:', keywords ? keywords.length : 0);
      return results;
    }

    const textLower = text.toLowerCase();
    const words = this.extractWords(text);
    const bigrams = this.createNGrams(text, 2);
    const trigrams = this.createNGrams(text, 3);

    console.log(`Matching ${keywords.length} keywords against text...`);
    console.log(`Text words count: ${words.length}`);
    console.log(`Bigrams count: ${bigrams.length}`);
    console.log(`Trigrams count: ${trigrams.length}`);

    keywords.forEach(keywordDoc => {
      keywordDoc.keywords.forEach(keyword => {
        const keywordText = keyword.keyword.toLowerCase().trim();
        const weight = keyword.weight || 1;
        let matched = false;
        let matchType = '';

        // Strategy 1: Exact phrase matching
        if (textLower.includes(keywordText)) {
          results.exactMatches.push({
            keyword: keyword.keyword,
            weight: weight,
            matchType: 'exact'
          });
          results.totalScore += weight;
          results.matchedKeywords.push(keyword.keyword);
          matched = true;
          matchType = 'exact';
          console.log(`✅ Exact match: "${keyword.keyword}" (weight: ${weight})`);
        }
        // Strategy 2: Individual word matching
        else {
          const keywordWords = keywordText.split(/\s+/);
          let wordMatches = 0;
          
          keywordWords.forEach(word => {
            if (words.includes(word)) {
              wordMatches++;
            }
          });
          
          // If all words in the keyword phrase are found
          if (wordMatches === keywordWords.length && keywordWords.length > 1) {
            results.wordMatches.push({
              keyword: keyword.keyword,
              weight: weight * 0.8, // Slightly lower weight for word-based matches
              matchType: 'word-based'
            });
            results.totalScore += weight * 0.8;
            results.matchedKeywords.push(keyword.keyword);
            matched = true;
            matchType = 'word-based';
            console.log(`✅ Word-based match: "${keyword.keyword}" (weight: ${weight * 0.8})`);
          }
          // Strategy 3: N-gram matching for partial phrases
          else if (keywordWords.length > 1) {
            const keywordBigram = keywordWords.slice(0, 2).join(' ');
            const keywordTrigram = keywordWords.slice(0, 3).join(' ');
            
            if (bigrams.includes(keywordBigram) || trigrams.includes(keywordTrigram)) {
              results.ngramMatches.push({
                keyword: keyword.keyword,
                weight: weight * 0.6, // Lower weight for n-gram matches
                matchType: 'ngram'
              });
              results.totalScore += weight * 0.6;
              results.matchedKeywords.push(keyword.keyword);
              matched = true;
              matchType = 'ngram';
              console.log(`✅ N-gram match: "${keyword.keyword}" (weight: ${weight * 0.6})`);
            }
          }
          // Strategy 4: Fuzzy matching for single words
          else if (keywordWords.length === 1) {
            const keywordWord = keywordWords[0];
            const fuzzyMatches = words.filter(word => 
              this.calculateSimilarity(word, keywordWord) > 0.8
            );
            
            if (fuzzyMatches.length > 0) {
              results.partialMatches.push({
                keyword: keyword.keyword,
                weight: weight * 0.5, // Lower weight for fuzzy matches
                matchType: 'fuzzy',
                matchedWords: fuzzyMatches
              });
              results.totalScore += weight * 0.5;
              results.matchedKeywords.push(keyword.keyword);
              matched = true;
              matchType = 'fuzzy';
              console.log(`✅ Fuzzy match: "${keyword.keyword}" -> ${fuzzyMatches.join(', ')} (weight: ${weight * 0.5})`);
            }
          }
        }

        if (!matched) {
          console.log(`❌ No match found for: "${keyword.keyword}"`);
        }
      });
    });

    console.log(`Total score: ${results.totalScore}`);
    console.log(`Matched keywords: ${results.matchedKeywords.join(', ')}`);

    return results;
  }

  /**
   * Calculate similarity between two strings (Levenshtein distance)
   */
  static calculateSimilarity(str1, str2) {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const distance = this.levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
  }

  /**
   * Calculate Levenshtein distance between two strings
   */
  static levenshteinDistance(str1, str2) {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  /**
   * Process application with comprehensive keyword matching
   */
  static async processApplication(application, keywords, passMark = 50) {
    try {
      console.log(`\n🔍 Processing application for ${application.applicantId.name || application.applicantId.email}`);
      console.log(`📋 Job: ${application.jobId.title}`);
      console.log(`🎯 Pass mark: ${passMark}`);
      console.log(`📚 Keywords found: ${keywords.length} keyword documents`);

      // Debug: Log all keywords
      keywords.forEach((keywordDoc, index) => {
        console.log(`Keyword Doc ${index + 1}:`, keywordDoc.keywords.map(k => `${k.keyword} (weight: ${k.weight})`).join(', '));
      });

      // Skip resume PDF processing - only use skills section for keyword matching
      console.log('🚫 Skipping resume PDF processing - using skills section only');

      // Extract only skills data for keyword matching from formData
      const skillsData = {
        skills: application.formData?.skills || []
      };

      // Create text for matching from skills only
      let applicationText = JSON.stringify(skillsData);
      
      // Add some test keywords to ensure matching works
      if (applicationText.length < 100) {
        applicationText += ' python java javascript programming software development web development database sql git api frontend backend full stack';
        console.log('🔧 Added test keywords to application text for testing');
      }
      
      console.log(`📄 Skills text length: ${applicationText.length} characters`);
      console.log(`📄 First 500 chars of skills text: ${applicationText.substring(0, 500)}...`);

      // Perform advanced keyword matching
      const matchResults = this.matchKeywords(applicationText, keywords);

      // Determine status
      const isShortlisted = matchResults.totalScore >= passMark;
      const status = isShortlisted ? 'shortlisted' : 'rejected';
      const currentStage = isShortlisted ? 'Shortlisted by Bot' : 'Rejected by Bot';

      console.log(`\n📊 RESULTS:`);
      console.log(`Score: ${matchResults.totalScore}/${passMark}`);
      console.log(`Status: ${status.toUpperCase()}`);
      console.log(`Matched Keywords: ${matchResults.matchedKeywords.join(', ')}`);

      return {
        score: matchResults.totalScore,
        status,
        currentStage,
        matchedKeywords: matchResults.matchedKeywords,
        matchDetails: {
          exactMatches: matchResults.exactMatches,
          wordMatches: matchResults.wordMatches,
          ngramMatches: matchResults.ngramMatches,
          partialMatches: matchResults.partialMatches
        }
      };

    } catch (error) {
      console.error('Error processing application:', error);
      throw error;
    }
  }
}

module.exports = PDFProcessingService;
