export default `
  /*==============================================================================
  Project: Bulk Synchronous Farm (BSF)
  Theme: BSF Skeleton
  Module: Problem-bsfCode.cpp (Problem-dependent Code)
  Prefix: PI
  Author: Nadezhda A. Ezhova
  Supervisor: Leonid B. Sokolinsky
  This source code is a part of BSF Skeleton
  ==============================================================================*/
  #include "Problem-Data.h"      // Problem Types 
  #include "Problem-Forwards.h"    // Problem Function Forwards
  #include "Problem-Include.h"    // Problem "Include" Files
  using namespace std;
  
  //----------------------- Predefined problem-dependent functions -----------------
  void PC_bsf_Init(bool* success) { // success=false if initialization is unsuccessful
  
  }; 
  
  void PC_bsf_AssignListSize(int* listSize) {
  
  };
  
  void PC_bsf_CopyData(PT_bsf_data_T* dataIn, PT_bsf_data_T* dataOut) {
  
  };
  
  void PC_bsf_MapF(PT_bsf_mapElem_T* mapElem, PT_bsf_reduceElem_T* reduceElem, PT_bsf_data_T* data,
    int* success // 1 - reduceElem was produced successfully; 0 - otherwise
  ){
  
  };
  
  void PC_bsf_ReduceF(PT_bsf_reduceElem_T* x, PT_bsf_reduceElem_T* y, PT_bsf_reduceElem_T* z) { // z = x + y
  
  };
  
  void PC_bsf_ProcessResults(
    bool* exit, // "true" if Stopping Criterion is satisfied, and "false" otherwise
    PT_bsf_reduceElem_T* reduceResult,
    int count, // Number of successfully produced Elrments of Reduce List
    PT_bsf_data_T* data // Next Approximation
  ){
  
  };
  
  void PC_bsf_ParametersOutput(int numOfWorkers, PT_bsf_data_T data) {
  
  };
  
  void PC_bsf_IterOutput(PT_bsf_reduceElem_T* reduceResult, int count, PT_bsf_data_T data,
    int iterCount, double elapsedTime) {
  
  //  static int counter = 0;  // Iteration Counter
  //  counter++;
  //  cout << "------------------ " << counter << " ------------------" << endl;
  
  };
  
  void PC_bsf_ProblemOutput(PT_bsf_reduceElem_T* reduceResult, int count, PT_bsf_data_T data,
    int iterCount, double t) {// Output Function
  
  };
  
  void PC_bsf_SetInitApproximation(PT_bsf_data_T* data) {
  
  };
  
  void PC_bsf_SetMapSubList(PT_bsf_mapElem_T* subList, int count, int offset, bool* success) {
    for (int j = 0; j < count; j++) {
  
    };
  };
  
  //----------------------------- User functions -----------------------------
  
`;