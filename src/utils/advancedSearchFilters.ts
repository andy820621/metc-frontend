import type { tableConfigItem } from "./tableMixin";
import type {
  FilterColumn,
  StringFilter,
  DateFilter,
  filtersType,
  StringFilterOption,
  SingleSelectFilter,
  FilterColumnCollection,
} from "src/api/api.type";
import { FilterColumnLogical } from "src/api/api.type";

export default function searchFiltersGenerator(config: tableConfigItem[]) {
  const filters = reactive<filtersType>([]);

  function convertConfigToFilters(config: tableConfigItem[]): filtersType {
    const tempResult: filtersType = [];
    const stringOptions: StringFilterOption[] = [];
    const defaultSearchText: string[] = [];

    config.forEach((item) => {
      // 檢查是否為字串搜尋類型
      if (item.searchType === "string" && item.searchOption) {
        stringOptions.push({
          label: item.searchOption.label,
          val: item.searchOption.val,
          type: item.searchOption.type,
        });
        // TODO: 確認以後是全選後下面程式碼可刪
        // if ("isDefault" in item.searchOption && item.searchOption.isDefault) {
        //   defaultSearchText.push(item.searchOption.val!);
        // }
      } else if (item.searchType === "date" && item.searchOption) {
        // 檢查是否為日期搜尋類型
        tempResult.push({
          title: item.searchTitle,
          type: item.searchType,
          dateRangeModel: {
            from: "",
            to: "",
          },
          searchOption: item.searchOption,
        });
      } else if (item.searchType === "singleSelect" && item.searchOption) {
        // 檢查是否為日期區間搜尋類型
        tempResult.push({
          title: item.searchTitle,
          type: item.searchType,
          searchOption: item.searchOption,
          model: undefined,
        });
      }
    });

    // 如果有字串搜尋選項，則添加到結果中
    if (stringOptions.length) {
      // console.log("now stringOptions", stringOptions);
      tempResult.unshift({
        title: "搜尋範圍",
        type: "string",
        options: stringOptions,
        // TODO: 確認以後是全選後下面程式碼可刪
        // model: defaultSearchText.length
        //   ? stringOptions
        //       .filter((option) => defaultSearchText?.includes(option.val))
        //       .map((option) => option.val)
        //   : [],
        model: stringOptions.map((option) => option.val), // 預設全選
      });
    }

    return tempResult;
  }

  filters.push(...convertConfigToFilters(config));

  return {
    filters,
    convertConfigToFilters,
  };
}

// 產出 filtersObject 方法
export function generateFiltersObject(
  filters: filtersType,
  searchText: string | undefined,
  typeName?: string
): FilterColumnCollection[] {
  const filtersObject: FilterColumnCollection[] = [];

  const stringTypeFilters: FilterColumn[] = [];
  const dateTypeFilters: FilterColumn[] = [];
  const singleSelectTypeFilters: FilterColumn[] = [];

  filters.forEach((filter) => {
    // 處理 string 類型
    const { type } = filter;
    if (type === "string") {
      const { model, options } = filter as StringFilter;
      console.log("{ model, options }", { model, options });
      if (model && model.length > 0 && searchText) {
        model.forEach((modelItem: string) => {
          const option = options.find((opt: any) => opt.val === modelItem);
          if (option) {
            stringTypeFilters.push({
              logical: FilterColumnLogical.Or,
              columnKey: {
                fieldName: option.val,
                typeName: (option.type ?? typeName),
              },
              value: searchText,
            });
          }
        });
      }
    } else if (type === "date") {
      // 處理 date 類型
      const { searchOption, dateRangeModel } = filter as DateFilter;
      const { startVal, endVal, type } = searchOption;
      if (dateRangeModel && startVal && endVal) {
        let beginValue = dateRangeModel.from
          ? new Date(dateRangeModel.from)
          : "";
        let endValue = dateRangeModel.to ? new Date(dateRangeModel.to) : "";

        if (dateRangeModel.from && dateRangeModel.to) {
          endValue = new Date(getNextDay(dateRangeModel.to));
          dateTypeFilters.push({
            logical: FilterColumnLogical.And,
            columnKey: {
              fieldName: startVal,
              typeName: (typeName ?? type),
            },
            beginValue,
            endValue,
          });
          dateTypeFilters.push({
            logical: FilterColumnLogical.And,
            columnKey: {
              fieldName: endVal,
              typeName: (typeName ?? type),
            },
            beginValue,
            endValue,
          });
        } else if (dateRangeModel.from) {
          endValue = new Date(getNextDay(dateRangeModel.from));
          dateTypeFilters.push({
            logical: FilterColumnLogical.And,
            columnKey: {
              fieldName: startVal,
              typeName: (typeName ?? type),
            },
            beginValue,
            endValue,
          });
        } else if (dateRangeModel.to) {
          beginValue = endValue;
          endValue = new Date(getNextDay(dateRangeModel.to));
          dateTypeFilters.push({
            logical: FilterColumnLogical.And,
            columnKey: {
              fieldName: endVal,
              typeName: (typeName ?? type),
            },
            beginValue,
            endValue,
          });
        }
      }
    } else if (type === "singleSelect") {
      // 處理 singleSelect 類型
      const { model, searchOption } = filter as SingleSelectFilter;
      if (model && searchOption.val) {
        singleSelectTypeFilters.push({
          logical: FilterColumnLogical.And,
          columnKey: {
            fieldName: searchOption.val,
            typeName: (searchOption.type ?? typeName),
          },
          value: model.value,
        });
      }
    }
  });

  if (stringTypeFilters.length) {
    filtersObject.push({
      logical: FilterColumnLogical.And,
      columns: stringTypeFilters,
    });
  }

  if (dateTypeFilters.length) {
    filtersObject.push({
      logical: FilterColumnLogical.And,
      columns: dateTypeFilters,
    });
  }

  if (singleSelectTypeFilters.length) {
    filtersObject.push({
      logical: FilterColumnLogical.And,
      columns: singleSelectTypeFilters,
    });
  }

  return filtersObject;
}

function getNextDay(dateModel: string) {
  const date = new Date(dateModel);
  date.setDate(date.getDate() + 1);
  return date;
}
