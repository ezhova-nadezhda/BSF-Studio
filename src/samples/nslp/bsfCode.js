export default `
  /*==============================================================================
  Project: NSLP (Non-Stationary Linear Programming)
  Theme: Quest Phase
  Module: Problem-bsfCode.cpp (Implementation of the Problem)
  Prefix: PI
  Author(s): Leonid B. Sokolinsky, Irina M. Sokolinskaya
  This source code has been produced with using BSF-skeleton
  ==============================================================================*/
  #include "Problem-Data.h"      // Problem Types 
  #include "Problem-Forwards.h"    // Problem Function Forwards
  #include "Problem-Include.h"      // Problem "Include" Files
  using namespace std;
  
  void PC_bsf_SetInitApproximation(PT_bsf_data_T* data) {
    for (int j = 0; j < PP_N; j++) // Generating coordinates of initial appriximation
      data->approximation[j] = PP_INIT_APPROX;
  };
  
  void PC_bsf_Init(bool* success) {
  
    // Parameters for Waying
    PD_direction = (float*)malloc(PP_N * sizeof(float));
    if (PD_direction == NULL) { 
      *success = false;
      return;
    };
  
    for (int j = 0; j < PP_N; j++)  // Direction of moving
      PD_direction[j] = 1;
    //PD_direction[0] = 1;
  };
  
  void PC_bsf_AssignListSize(int* listSize) {
    *listSize = PP_M;
  };
  
  void PC_bsf_CopyData(PT_bsf_data_T* dataIn, PT_bsf_data_T* dataOut) {
    for (int j = 0; j < PP_N; j++) {
      dataOut->approximation[j] = dataIn->approximation[j];
      dataOut->shift[j] = dataIn->shift[j];
    };
  };
  
  void PC_bsf_SetMapSubList(PT_bsf_mapElem_T* subList, int count, int offset, bool* success) {
    //*debug*/int rank; MPI_Comm_rank(MPI_COMM_WORLD, &rank); cout << rank << ":=========>PC_bsf_SetMapSubList 1: count = " << count << "\\toffset = " << offset << endl;
    for (int i = 0; i < count; i++) {
      subList[i].inequality = (float*)calloc(PP_N + 1,sizeof(float));
      if (subList[i].inequality == NULL) {
        *success = false;
        return;
      };
      for (int j = 0; j < PP_N + 1; j++)
        subList[i].inequality[j] = 0;
    };
    for (int i = offset; i < PF_MIN(PP_N, offset + count); i++) {
      subList[i - offset].inequality[i] = 1;
      subList[i - offset].inequality[PP_N] = PP_SF;
    };
    if ((offset <= PP_N) && (offset + count > PP_N)) {
      for (int j = 0; j < PP_N; j++)
        subList[PP_N - offset].inequality[j] = 1;
      subList[PP_N - offset].inequality[PP_N] = PP_SF * (PP_N - 1) + PP_SF / 2;
    };
    if ((offset <= PP_N + 1) && (offset + count > PP_N + 1)) {
      for (int j = 0; j < PP_N; j++)
        subList[PP_N + 1 - offset].inequality[j] = -1;
      subList[PP_N + 1 - offset].inequality[PP_N] = -PP_SF / 2;
    };
    for (int i = PF_MAX(PP_N + 2, offset); i < offset + count; i++) 
      subList[i - offset].inequality[i - PP_N - 2] = -1;
  };
  
  void PC_bsf_MapF(PT_bsf_mapElem_T* mapElem, PT_bsf_reduceElem_T* reduceElem, PT_bsf_data_T* data,
    int* success // 1 - reduceElem was produced successfully (default); 0 - otherwise
  ){
    float factor;
    float wayed_b;
  
    wayed_b = Way_b(mapElem->inequality, data->shift);
  
    factor = PF_MIN(wayed_b - DotProduct(data->approximation, mapElem->inequality), 0) / NormSquare(mapElem->inequality);
  
    if (factor == 0)
      *success = 0;
  
    for (int j = 0; j < PP_N; j++)
      reduceElem->point[j] = factor * mapElem->inequality[j];
  
    reduceElem->pointIn = PointIn(data->approximation, mapElem->inequality, wayed_b);
  
    //*debug*/cout << "PC_bsf_MapF: pointIn=" << reduceElem->pointIn << endl;
  };
  
  void PC_bsf_ReduceF(PT_bsf_reduceElem_T* x, PT_bsf_reduceElem_T* y, PT_bsf_reduceElem_T* z) { // z = x + y
    for (int j = 0; j < PP_N; j++)
      z->point[j] = x->point[j] + y->point[j];
    z->pointIn = x->pointIn && y->pointIn;
  };
  
  void PC_bsf_ProcessResults(
    bool* exit, // "true" if Stopping Criterion is satisfied, and "false" otherwise
    PT_bsf_reduceElem_T* reduceResult,
    int count, // Number of successfully produced Elrments of Reduce List
    PT_bsf_data_T* data // Current Approximation
  ) {
    PD_iterCounter++;
    for (int j = 0; j < PP_N; j++) PD_previousShift[j] = data->shift[j];
    GetShift(data->shift);
    //*debug*/cout << "PC_bsf_ProcessResults: pointIn=" << reduceResult->pointIn << endl;
    if (ExitCondition(reduceResult, count, data, PD_iterCounter))
      *exit = true;
    else {
      *exit = false;
  
      // New method
      float norm = 0;
      for (int j = 0; j < PP_N; j++)
        norm += reduceResult->point[j] * reduceResult->point[j];
      norm = sqrtf(norm);
  
      for (int j = 0; j < PP_N; j++)
        data->approximation[j] += (float)(PP_LAMBDA * reduceResult->point[j] / norm);
        //data->approximation[j] += (float)(PP_LAMBDA * reduceResult->point[j] / count);
    };
    //cout << "Number of successfully produced Elrments of Reduce List: " << count << endl;
  };
  
  void PC_bsf_ParametersOutput(int numOfWorkers, PT_bsf_data_T data) {
    cout << "=================================================== Quest Fejer ====================================================" << endl;
    cout << "Number of Workers: " << numOfWorkers << endl;
    cout << "Velosity: " << PP_VELOCITY << endl;
  #ifdef PP_BSF_OMP
  #ifdef PP_BSF_NUM_THREADS
    cout << "Number of Threads: " << PP_BSF_NUM_THREADS << endl;
  #else
    cout << "Number of Threads: " << omp_get_num_procs() << endl;
  #endif // PP_BSF_NUM_THREADS
  #else
    cout << "OpenMP is turned off!" << endl;
  #endif // PP_BSF_OMP
    cout << "Dimension: N = " << PP_N << endl;
    cout << "Number of Constraints: M = " << PP_M << endl;
    cout << "Scale Factor: SF = " << PP_SF << endl;
    cout << "Relaxation Factor: LAMBDA = " << PP_LAMBDA << endl;
    cout << "Eps_Relax = " << PP_EPS_RELAX << endl;
    cout << "Eps_In = " << PP_EPS_IN << endl;
    cout << "Eps_Lag = " << PP_EPS_LAG << endl;
  
  #ifdef PP_MATRIX_OUTPUT
    cout << "------- Matrix A & Column b -------" << endl;
    for (int i = 0; i < PP_N; i++) {
      for (int j = 0; j < i; j++)
        cout << setw(5) << 0;
      cout << setw(5) << 1;
      for (int j = i + 1; j < PP_N; j++)
        cout << setw(5) << 0;
      cout << setw(5) << PP_SF << endl;
    };
    for (int j = 0; j < PP_N; j++)
      cout << setw(5) << 1;
    cout << setw(5) << PP_SF * (PP_N - 1) + PP_SF / 2 << endl;
    for (int j = 0; j < PP_N; j++)
      cout << setw(5) << -1;
    cout << setw(5) << -PP_SF / 2 << endl;
    for (int i = 0; i < PP_N; i++) {
      for (int j = 0; j < i; j++)
        cout << setw(5) << 0;
      cout << setw(5) << -1;
      for (int j = i + 1; j < PP_N; j++)
        cout << setw(5) << 0;
      cout << setw(5) << 0 << endl;
    };
  #endif // PP_MATRIX_OUTPUT
    cout << "Start Point: "; for (int j = 0; j < PF_MIN(PP_OUTPUT_LIMIT, PP_N); j++) cout << setw(7) << data.approximation[j]; cout << (PP_OUTPUT_LIMIT < PP_N ? "..." : "") << endl;
    cout << "Direction: "; for (int j = 0; j < PF_MIN(PP_OUTPUT_LIMIT, PP_N); j++) cout << setw(7) << PD_direction[j]; cout << (PP_OUTPUT_LIMIT < PP_N ? "..." : "") << endl;
    cout << "-------------------------------------------" << endl;
  };
  
  void PC_bsf_IterOutput(PT_bsf_reduceElem_T* reduceResult, int count, PT_bsf_data_T data,
    int iterCount, double elapsedTime) {
    cout << "-------------------- " << PD_iterCounter << " -------------------" << endl;
    //cout << "Reduce Result:"; for (int j = 0; j < PF_MIN(PP_OUTPUT_LIMIT, PP_N); j++) cout << setw(10) << reduceResult->point [j]; cout << (PP_OUTPUT_LIMIT < PP_N ? "..." : "") << endl;/**/
    cout << "Shift:\\t\\t\\t"; for (int j = 0; j < PF_MIN(PP_OUTPUT_LIMIT, PP_N); j++) cout << setw(12) << data.shift[j]; cout << (PP_OUTPUT_LIMIT < PP_N - 1 ? "..." : "") << endl;/**/
    cout << "Approximation:\\t\\t"; for (int j = 0; j < PF_MIN(PP_OUTPUT_LIMIT, PP_N); j++) cout << setw(12) << data.approximation[j]; cout << (PP_OUTPUT_LIMIT < PP_N ? "..." : "") << endl;/**/
    cout << "Shift - Approximation :\\t"; for (int j = 0; j < PF_MIN(PP_OUTPUT_LIMIT, PP_N); j++) cout << setw(12) << data.shift[j] - data.approximation[j]; cout << (PP_OUTPUT_LIMIT < PP_N ? "..." : "") << endl;
    cout << "PointIn = " << setw(1) << reduceResult->pointIn << endl;
  };
  
  void PC_bsf_ProblemOutput(PT_bsf_reduceElem_T* reduceResult, int count, PT_bsf_data_T data,
    int iterCount, double t) {// Output Function
    cout << "=============================================" << endl;
    cout << "Time: " << t << endl;
    cout << "Iterations: " << iterCount << endl;
    cout << "Solution: "; for (int j = 0; j < PF_MIN(PP_OUTPUT_LIMIT, PP_N); j++) cout << setw(12) << data.approximation[j]; cout << (PP_OUTPUT_LIMIT < PP_N ? "..." : "") << endl;/**/
    cout << "Solution without Shift: "; for (int j = 0; j < PF_MIN(PP_OUTPUT_LIMIT, PP_N); j++) cout << setw(12) << data.approximation[j] - PD_previousShift[j]; cout << (PP_OUTPUT_LIMIT < PP_N ? "..." : "") << endl;
    /*float coordinate_sum = 0;
    for (int j = 0; j < PP_N; j++) 
      coordinate_sum += data.approximation[j] - PD_previousShift[j];
    cout << "Sum of coordindtes: " << coordinate_sum << endl;/**/
  };
  
  //----------------------------- User functions -----------------------------
  static bool PointIn(PT_point_T point, PT_inequality_T inequality, float wayed_b) { // If the point satisfies to the inequality 
    float sum = 0;
  
  /*#ifdef PP_BSF_OMP
  #ifdef PP_BSF_NUM_THREADS
  #pragma omp parallel for num_threads(PP_BSF_NUM_THREADS) reduction(+:sum)
  #else
  #pragma omp parallel for reduction(+:sum)
  #endif // PP_BSF_NUM_THREADS
  #endif // PP_BSF_OMP/**/
    for (int j = 0; j < PP_N; j++)
      sum += inequality[j] * point[j];
    if (sum > wayed_b + PP_EPS_IN)
      return false;
    else 
      return true;
  };
  
  static float DotProduct(PT_point_T x, PT_point_T y) {
    float sum = 0;
  /*#ifdef PP_BSF_OMP
  #ifdef PP_BSF_NUM_THREADS
  #pragma omp parallel for num_threads(PP_BSF_NUM_THREADS) reduction(+:sum)
  #else
  #pragma omp parallel for reduction(+:sum)
  #endif // PP_BSF_NUM_THREADS
  #endif // PP_BSF_OMP/**/
    for (int j = 0; j < PP_N; j++)
      sum += x[j] * y[j];
    return sum;
  };
  
  static float NormSquare(PT_point_T x) {
    float sum = 0;
  /*#ifdef PP_BSF_OMP
  #ifdef PP_BSF_NUM_THREADS
  #pragma omp parallel for num_threads(PP_BSF_NUM_THREADS) reduction(+:sum)
  #else
  #pragma omp parallel for reduction(+:sum)
  #endif // PP_BSF_NUM_THREADS
  #endif // PP_BSF_OMP/**/
    for (int j = 0; j < PP_N; j++)
      sum += x[j] * x[j];
    return sum;
  };
  
  static float Way_b(PT_inequality_T inequality, PT_shift_T shift) {
    float sum = inequality[PP_N];
  
    for (int j = 0; j < PP_N; j++)
      sum += inequality[j] * shift[j];
    return sum;
  };
  
  static bool ExitCondition(PT_bsf_reduceElem_T* reduceResult, int count, PT_bsf_data_T* data, int iterCounter) {
    static float shift_approx_prev, shift_approx_next = FLT_MAX;
  
    if (reduceResult->pointIn) {
      //*debug*/cout << "pointIn=" << reduceResult->pointIn << endl;
      return true;
    };
  
    shift_approx_next = data->shift[0] - data->approximation[0];
    if (iterCounter > 100)
      if (shift_approx_prev + PP_EPS_LAG < shift_approx_next) {
        cout << ">>>>>>>>>>>>>>>>> Process began to lag!!! <<<<<<<<<<<<<<<<<<<<<<" << endl;
        cout << "shift_approx_next - shift_approx_prev = " << shift_approx_next - shift_approx_prev << endl;
        return true;
      };
    shift_approx_prev = shift_approx_next;
  
  #ifdef PP_MAX_ITER_COUNT
    if (iterCounter > PP_MAX_ITER_COUNT) {
      cout << "Acceptable maximum number of iterations is exceeded: PP_MAX_ITER_COUNT = " << PP_MAX_ITER_COUNT << endl;
      return true;
    };
  #endif // PP_MAX_ITER_COUNT
  
    float sum = 0;
  /*#ifdef PP_BSF_OMP
  #ifdef PP_BSF_NUM_THREADS
  #pragma omp parallel for num_threads(PP_BSF_NUM_THREADS) reduction(+:sum)
  #else
  #pragma omp parallel for reduction(+:sum)
  #endif // PP_BSF_NUM_THREADS
  #endif // PP_BSF_OMP/**/
    for (int j = 0; j < PP_N; j++) {
      float s;
      s = (float)(PP_LAMBDA * reduceResult->point[j] / count);
      sum += s * s;
    };
  
    if (sum < PP_EPS_RELAX) 
      return true;
    
    return false;
  };
  
  static void GetShift(PT_shift_T shift) {
    static double t0 = MPI_Wtime();
    double delta_t;
  
    delta_t = MPI_Wtime() - t0;
  
    for (int j = 0; j < PP_N; j++) 
      shift[j] = (float)(PP_VELOCITY * PD_direction[j] * delta_t);/**/
      /*debug*///shift[j] = 0;
  };
`;
