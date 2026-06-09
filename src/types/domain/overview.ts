
// ----------------------------------------------------------------------

/**
 * Propriedades do Dashboard.
 */
export type OverviewDashboardView = {
    bar: OverviewBarView;
    tasks: OverviewTasksBlockView;
    widgets: OverviewWidgetView[];
};

// ----------------------------------------------------------------------

/**
 * Propriedades dos gráficos de Tasks.
 */
export type OverviewTasksBlockView = {
    overviewId: string;
    list: OverviewTaskView[];
};

// ----------------------------------------------------------------------

/**
 * Propriedades da lista de Tasks.
 */
export type OverviewTaskView = {
    id: string;
    name: string;
};

// ----------------------------------------------------------------------

/**
 * Propriedades dos gráficos Widgets.
 */
export type OverviewWidgetView = {
    overviewId: string;
    total: number;
    percent: number;
    chart: OverviewWidgetChartView;
};

// ----------------------------------------------------------------------

/**
 * Propriedades da propriedade chart dos Widgets.
 */
export type OverviewWidgetChartView = {
    series: number[];
    categories: string[];
};

// ----------------------------------------------------------------------

/**
 * Representa uma gráfico de barras no dashboard.
 */
export type OverviewBarView = {
    overviewId: string;
    chart: OverviewBarChartView;
};

// ----------------------------------------------------------------------

/**
 * Representa os dados do gráfico de barras do dashboard.
 */
export type OverviewBarChartView = {
    categories: string[];
    series: OverviewBarChartSeriesView[];
};

// ----------------------------------------------------------------------

/**
 * Representa os dados de series do gráfico de barras do dashboard.
 */
export type OverviewBarChartSeriesView = {
    name: string;
    data: number[];
};
